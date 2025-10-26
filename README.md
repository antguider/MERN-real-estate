# MERN Real Estate - Enterprise Edition

A comprehensive real estate platform built with modern web technologies, featuring advanced search capabilities, user management, property listings, and enterprise-grade security.

## 🚀 Features

### Core Features
- **Property Listings**: Create, manage, and browse property listings
- **Advanced Search**: Filter by location, price, property type, amenities, and more
- **User Management**: Registration, authentication, profiles, and role-based access
- **Real-time Messaging**: Communication between users and agents
- **Property Reviews**: Rating and review system for properties
- **Saved Properties**: Users can save favorite properties
- **Property Viewings**: Schedule and manage property viewings
- **Notifications**: Real-time notifications for important updates

### Enterprise Features
- **Security**: JWT authentication, rate limiting, input validation, XSS protection
- **Scalability**: Docker containerization, Redis caching, optimized database queries
- **Monitoring**: Comprehensive logging, error tracking, health checks
- **Testing**: Unit tests, integration tests, and test coverage
- **CI/CD**: Automated testing, building, and deployment pipelines
- **Documentation**: API documentation with Swagger/OpenAPI
- **Performance**: Image optimization, lazy loading, pagination

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Prisma ORM
- **Redis** for caching and sessions
- **JWT** for authentication
- **Winston** for logging
- **Jest** for testing

### Frontend
- **React 18** with modern hooks
- **React Router** for navigation
- **React Query** for state management
- **React Hook Form** for form handling
- **SCSS** for styling
- **Framer Motion** for animations
- **Vite** for build tooling

### DevOps & Infrastructure
- **Docker** for containerization
- **Docker Compose** for local development
- **GitHub Actions** for CI/CD
- **Nginx** for reverse proxy
- **MongoDB Atlas** for production database

## 📋 Prerequisites

- Node.js 18+ 
- npm 8+
- MongoDB (local or Atlas)
- Redis (optional, for caching)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/MERN-real-estate.git
cd MERN-real-estate
```

### 2. Install Dependencies
```bash
npm run setup
```

### 3. Environment Setup
```bash
# Copy environment files
cp api/env.example api/.env
cp client/env.example client/.env

# Edit the environment variables
# api/.env - Database, JWT secrets, etc.
# client/.env - API URLs, etc.
```

### 4. Database Setup
```bash
# Generate Prisma client
npm run db:generate

# Push database schema
npm run db:push

# Seed database (optional)
npm run db:seed
```

### 5. Start Development Servers
```bash
# Start both API and client
npm run dev

# Or start individually
npm run dev:api    # API server on port 8800
npm run dev:client # Client server on port 5173
```

## 🐳 Docker Setup

### Development with Docker
```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Production Deployment
```bash
# Build production images
docker-compose -f docker-compose.prod.yml up -d
```

## 📁 Project Structure

```
MERN-real-estate/
├── api/                    # Backend API
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom middleware
│   ├── routes/            # API routes
│   ├── lib/               # Utilities and configurations
│   ├── prisma/            # Database schema and migrations
│   ├── uploads/           # File uploads
│   └── logs/              # Application logs
├── client/                # Frontend React app
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom hooks
│   │   ├── services/      # API services
│   │   ├── store/         # State management
│   │   └── utils/         # Utility functions
├── .github/               # GitHub Actions workflows
├── docker-compose.yml     # Docker services configuration
└── README.md
```

## 🔧 Configuration

### Environment Variables

#### API (.env)
```env
# Database
DATABASE_URL="mongodb://localhost:27017/real-estate"

# JWT
JWT_SECRET_KEY="your-super-secret-jwt-key"
JWT_REFRESH_SECRET="your-refresh-token-secret"

# Server
PORT=8800
NODE_ENV="development"
CLIENT_URL="http://localhost:5173"

# Redis (optional)
REDIS_URL="redis://localhost:6379"

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH="./uploads"
```

#### Client (.env)
```env
VITE_API_BASE_URL="http://localhost:8800/api"
VITE_APP_NAME="MERN Real Estate"
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run API tests
npm run test:api

# Run client tests
npm run test:client

# Run tests with coverage
npm run test:coverage
```

## 📊 API Documentation

Once the server is running, visit:
- **API Docs**: http://localhost:8800/api/docs
- **Health Check**: http://localhost:8800/health

## 🔒 Security Features

- **Authentication**: JWT-based authentication with refresh tokens
- **Authorization**: Role-based access control (USER, AGENT, ADMIN)
- **Rate Limiting**: Prevents abuse and DDoS attacks
- **Input Validation**: Comprehensive validation using express-validator
- **Security Headers**: Helmet.js for security headers
- **XSS Protection**: XSS-clean middleware
- **NoSQL Injection**: MongoDB sanitization
- **CORS**: Configurable cross-origin resource sharing

## 🚀 Deployment

### Production Checklist
- [ ] Set production environment variables
- [ ] Configure SSL certificates
- [ ] Set up MongoDB Atlas cluster
- [ ] Configure Redis instance
- [ ] Set up monitoring and logging
- [ ] Configure CDN for static assets
- [ ] Set up backup strategies

### Cloud Deployment Options
- **AWS**: EC2, ECS, RDS, ElastiCache
- **Google Cloud**: Compute Engine, Cloud Run, Cloud SQL
- **Azure**: App Service, Container Instances, Cosmos DB
- **DigitalOcean**: Droplets, Managed Databases

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [Wiki](https://github.com/your-username/MERN-real-estate/wiki)
- **Issues**: [GitHub Issues](https://github.com/your-username/MERN-real-estate/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/MERN-real-estate/discussions)

## 🙏 Acknowledgments

- React team for the amazing framework
- Express.js team for the robust backend framework
- Prisma team for the excellent ORM
- MongoDB team for the flexible database
- All open-source contributors

---

**Built with ❤️ by [Your Company]**
