# Docker Configuration for API
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Create uploads directory
RUN mkdir -p uploads logs

# Expose port
EXPOSE 8800

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8800/health || exit 1

# Start the application
CMD ["npm", "start"]
