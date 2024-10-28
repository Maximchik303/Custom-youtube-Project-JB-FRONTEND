# Use the official Node.js image from the Docker Hub
FROM node:16

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the project files
COPY . .

# Build the React app
RUN npm run build

# Use a simple server to serve the React app
FROM nginx:alpine
COPY --from=0 /app/build /usr/share/nginx/html
CMD ["nginx", "-g", "daemon off;"]
