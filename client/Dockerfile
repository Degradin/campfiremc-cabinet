# Stage 1: Build
FROM node:18-alpine AS build

WORKDIR /usr/src/app

# Set NODE_PATH to src to allow absolute imports
ENV NODE_PATH=src

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# Stage 2: Production
FROM nginx:stable-alpine

COPY --from=build /usr/src/app/build /usr/share/nginx/html

# Nginx listens on port 80 by default
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
