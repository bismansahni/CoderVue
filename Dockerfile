# Base image
FROM node:18

# Metadata
LABEL authors="bismansahni"

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json for dependency installation
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Build the Next.js application
RUN npm run build

# Expose the port Next.js will run on
EXPOSE 3000

# Default ENTRYPOINT
ENTRYPOINT ["top", "-b"]
