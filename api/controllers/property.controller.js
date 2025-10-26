import prisma from "../lib/prisma.js";
import logger from "../lib/logger.js";

export const getAllProperties = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      minPrice,
      maxPrice,
      propertyType,
      listingType,
      city,
      state,
      bedrooms,
      bathrooms,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build filter object
    const where = {
      status: 'AVAILABLE',
      ...(minPrice && { price: { gte: parseFloat(minPrice) } }),
      ...(maxPrice && { price: { lte: parseFloat(maxPrice) } }),
      ...(propertyType && { propertyType }),
      ...(listingType && { listingType }),
      ...(city && { city: { contains: city, mode: 'insensitive' } }),
      ...(state && { state: { contains: state, mode: 'insensitive' } }),
      ...(bedrooms && { bedrooms: { gte: parseInt(bedrooms) } }),
      ...(bathrooms && { bathrooms: { gte: parseInt(bathrooms) } }),
    };

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { [sortBy]: sortOrder },
        include: {
          agent: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              avatar: true,
              phone: true,
            }
          },
          reviews: {
            select: {
              rating: true,
            }
          },
          _count: {
            select: {
              reviews: true,
              savedProperties: true,
            }
          }
        }
      }),
      prisma.property.count({ where })
    ]);

    // Calculate average rating for each property
    const propertiesWithRating = properties.map(property => {
      const avgRating = property.reviews.length > 0
        ? property.reviews.reduce((sum, review) => sum + review.rating, 0) / property.reviews.length
        : 0;
      
      return {
        ...property,
        averageRating: Math.round(avgRating * 10) / 10,
        reviews: undefined // Remove reviews array from response
      };
    });

    res.status(200).json({
      success: true,
      data: {
        properties: propertiesWithRating,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit),
        }
      }
    });
  } catch (error) {
    logger.error("Get all properties error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching properties"
    });
  }
};

export const getPropertyById = async (req, res) => {
  try {
    const { id } = req.params;

    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        agent: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
            phone: true,
            email: true,
          }
        },
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: {
            reviews: true,
            savedProperties: true,
            viewings: true,
          }
        }
      }
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found"
      });
    }

    // Calculate average rating
    const avgRating = property.reviews.length > 0
      ? property.reviews.reduce((sum, review) => sum + review.rating, 0) / property.reviews.length
      : 0;

    res.status(200).json({
      success: true,
      data: {
        ...property,
        averageRating: Math.round(avgRating * 10) / 10,
      }
    });
  } catch (error) {
    logger.error("Get property by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching property"
    });
  }
};

export const createProperty = async (req, res) => {
  try {
    const propertyData = {
      ...req.body,
      agentId: req.user.id,
    };

    const property = await prisma.property.create({
      data: propertyData,
      include: {
        agent: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
          }
        }
      }
    });

    logger.info(`New property created: ${property.title} by ${req.user.username}`);

    res.status(201).json({
      success: true,
      message: "Property created successfully",
      data: property
    });
  } catch (error) {
    logger.error("Create property error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating property"
    });
  }
};

export const updateProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Check if property exists and user has permission to update
    const existingProperty = await prisma.property.findUnique({
      where: { id }
    });

    if (!existingProperty) {
      return res.status(404).json({
        success: false,
        message: "Property not found"
      });
    }

    if (existingProperty.agentId !== userId && userRole !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this property"
      });
    }

    const updatedProperty = await prisma.property.update({
      where: { id },
      data: req.body,
      include: {
        agent: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
          }
        }
      }
    });

    logger.info(`Property updated: ${updatedProperty.title} by ${req.user.username}`);

    res.status(200).json({
      success: true,
      message: "Property updated successfully",
      data: updatedProperty
    });
  } catch (error) {
    logger.error("Update property error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating property"
    });
  }
};

export const deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Check if property exists and user has permission to delete
    const existingProperty = await prisma.property.findUnique({
      where: { id }
    });

    if (!existingProperty) {
      return res.status(404).json({
        success: false,
        message: "Property not found"
      });
    }

    if (existingProperty.agentId !== userId && userRole !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this property"
      });
    }

    await prisma.property.delete({
      where: { id }
    });

    logger.info(`Property deleted: ${existingProperty.title} by ${req.user.username}`);

    res.status(200).json({
      success: true,
      message: "Property deleted successfully"
    });
  } catch (error) {
    logger.error("Delete property error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting property"
    });
  }
};

export const searchProperties = async (req, res) => {
  try {
    const {
      q, // search query
      page = 1,
      limit = 10,
      minPrice,
      maxPrice,
      propertyType,
      listingType,
      city,
      state,
      bedrooms,
      bathrooms,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build search filter
    const where = {
      status: 'AVAILABLE',
      ...(q && {
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
          { address: { contains: q, mode: 'insensitive' } },
          { city: { contains: q, mode: 'insensitive' } },
          { state: { contains: q, mode: 'insensitive' } },
        ]
      }),
      ...(minPrice && { price: { gte: parseFloat(minPrice) } }),
      ...(maxPrice && { price: { lte: parseFloat(maxPrice) } }),
      ...(propertyType && { propertyType }),
      ...(listingType && { listingType }),
      ...(city && { city: { contains: city, mode: 'insensitive' } }),
      ...(state && { state: { contains: state, mode: 'insensitive' } }),
      ...(bedrooms && { bedrooms: { gte: parseInt(bedrooms) } }),
      ...(bathrooms && { bathrooms: { gte: parseInt(bathrooms) } }),
    };

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { [sortBy]: sortOrder },
        include: {
          agent: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              avatar: true,
            }
          },
          reviews: {
            select: {
              rating: true,
            }
          },
          _count: {
            select: {
              reviews: true,
              savedProperties: true,
            }
          }
        }
      }),
      prisma.property.count({ where })
    ]);

    // Calculate average rating for each property
    const propertiesWithRating = properties.map(property => {
      const avgRating = property.reviews.length > 0
        ? property.reviews.reduce((sum, review) => sum + review.rating, 0) / property.reviews.length
        : 0;
      
      return {
        ...property,
        averageRating: Math.round(avgRating * 10) / 10,
        reviews: undefined
      };
    });

    res.status(200).json({
      success: true,
      data: {
        properties: propertiesWithRating,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit),
        },
        searchQuery: q || null,
      }
    });
  } catch (error) {
    logger.error("Search properties error:", error);
    res.status(500).json({
      success: false,
      message: "Error searching properties"
    });
  }
};

export const getFeaturedProperties = async (req, res) => {
  try {
    const properties = await prisma.property.findMany({
      where: {
        featured: true,
        status: 'AVAILABLE'
      },
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: {
        agent: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
          }
        },
        reviews: {
          select: {
            rating: true,
          }
        },
        _count: {
          select: {
            reviews: true,
            savedProperties: true,
          }
        }
      }
    });

    // Calculate average rating for each property
    const propertiesWithRating = properties.map(property => {
      const avgRating = property.reviews.length > 0
        ? property.reviews.reduce((sum, review) => sum + review.rating, 0) / property.reviews.length
        : 0;
      
      return {
        ...property,
        averageRating: Math.round(avgRating * 10) / 10,
        reviews: undefined
      };
    });

    res.status(200).json({
      success: true,
      data: propertiesWithRating
    });
  } catch (error) {
    logger.error("Get featured properties error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching featured properties"
    });
  }
};

export const getUserProperties = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where: { agentId: userId },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          reviews: {
            select: {
              rating: true,
            }
          },
          _count: {
            select: {
              reviews: true,
              savedProperties: true,
              viewings: true,
            }
          }
        }
      }),
      prisma.property.count({ where: { agentId: userId } })
    ]);

    res.status(200).json({
      success: true,
      data: {
        properties,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit),
        }
      }
    });
  } catch (error) {
    logger.error("Get user properties error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user properties"
    });
  }
};

export const saveProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if property exists
    const property = await prisma.property.findUnique({
      where: { id }
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found"
      });
    }

    // Check if already saved
    const existingSaved = await prisma.savedProperty.findUnique({
      where: {
        userId_propertyId: {
          userId,
          propertyId: id
        }
      }
    });

    if (existingSaved) {
      return res.status(400).json({
        success: false,
        message: "Property already saved"
      });
    }

    await prisma.savedProperty.create({
      data: {
        userId,
        propertyId: id
      }
    });

    res.status(200).json({
      success: true,
      message: "Property saved successfully"
    });
  } catch (error) {
    logger.error("Save property error:", error);
    res.status(500).json({
      success: false,
      message: "Error saving property"
    });
  }
};

export const unsaveProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const savedProperty = await prisma.savedProperty.findUnique({
      where: {
        userId_propertyId: {
          userId,
          propertyId: id
        }
      }
    });

    if (!savedProperty) {
      return res.status(404).json({
        success: false,
        message: "Property not found in saved list"
      });
    }

    await prisma.savedProperty.delete({
      where: {
        userId_propertyId: {
          userId,
          propertyId: id
        }
      }
    });

    res.status(200).json({
      success: true,
      message: "Property removed from saved list"
    });
  } catch (error) {
    logger.error("Unsave property error:", error);
    res.status(500).json({
      success: false,
      message: "Error removing property from saved list"
    });
  }
};

export const getSavedProperties = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [savedProperties, total] = await Promise.all([
      prisma.savedProperty.findMany({
        where: { userId },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          property: {
            include: {
              agent: {
                select: {
                  id: true,
                  username: true,
                  firstName: true,
                  lastName: true,
                  avatar: true,
                }
              },
              reviews: {
                select: {
                  rating: true,
                }
              },
              _count: {
                select: {
                  reviews: true,
                  savedProperties: true,
                }
              }
            }
          }
        }
      }),
      prisma.savedProperty.count({ where: { userId } })
    ]);

    // Calculate average rating for each property
    const propertiesWithRating = savedProperties.map(saved => ({
      ...saved,
      property: {
        ...saved.property,
        averageRating: saved.property.reviews.length > 0
          ? Math.round((saved.property.reviews.reduce((sum, review) => sum + review.rating, 0) / saved.property.reviews.length) * 10) / 10
          : 0,
        reviews: undefined
      }
    }));

    res.status(200).json({
      success: true,
      data: {
        savedProperties: propertiesWithRating,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit),
        }
      }
    });
  } catch (error) {
    logger.error("Get saved properties error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching saved properties"
    });
  }
};
