# ==========================================
# Stage 1: Build static assets
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .

# Set API URL for the build
ENV VITE_API_URL=/api
RUN npm run build

# ==========================================
# Stage 2: Serve with Nginx
# ==========================================
FROM nginx:alpine

# Copy built static files to nginx html folder
COPY --from=builder /usr/src/app/dist /usr/share/nginx/html

# Add custom Nginx configuration to handle React Router and proxy requests
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
