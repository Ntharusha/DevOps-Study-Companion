# ==========================================
# Stage 1: Build & Dependency Installation
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Copy package files first to leverage Docker layer caching
COPY package*.json ./

# Install all dependencies (including devDependencies if needed for build steps)
RUN npm ci

# Copy the rest of the application files
COPY . .

# Prune devDependencies to keep production image light
RUN npm prune --production

# ==========================================
# Stage 2: Minimalist Production Image
# ==========================================
FROM node:20-alpine

WORKDIR /usr/src/app

# Set Node environment to production
ENV NODE_ENV=production

# Copy built node_modules and code from the builder stage
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/server.js ./server.js
COPY --from=builder /usr/src/app/routes ./routes
COPY --from=builder /usr/src/app/models ./models

# Run the container as a non-root user for security (Alpine Node image provides the 'node' user)
USER node

# Expose backend port
EXPOSE 5000

# Start application
CMD ["node", "server.js"]
