# Build stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Set environment variables
ENV NODE_ENV=production

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy project files
COPY . .

EXPOSE 3000

# Start with host 0.0.0.0 to allow external access
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# # Build the app
# RUN npm run build

# # Production stage
# FROM nginx:alpine

# # Install curl for health checks
# RUN apk add --no-cache curl

# # Copy nginx configuration
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# # Copy built assets from builder stage
# COPY --from=builder /app/dist /usr/share/nginx/html

# # Expose port
# EXPOSE 80

# # Start nginx with debug mode
# CMD ["nginx", "-g", "daemon off;"]
