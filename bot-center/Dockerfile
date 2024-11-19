FROM node:22-alpine AS build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

COPY . .

# Copy the rest of the application code
RUN npm run build

FROM node:22-alpine AS production

ENV GATEWAY_PORT=6793
ENV SERVER_PORT=6794

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

RUN npm ci --save-prod

COPY --from=build /app/dist ./dist

VOLUME /app/data

# Run the application
CMD ["npm", "start"]
