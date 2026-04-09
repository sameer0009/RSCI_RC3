# Build and Production Stage
FROM node:20-alpine

WORKDIR /app

# Install dependencies only once
COPY package*.json ./
RUN npm install

# Copy source and build
COPY . .
RUN npm run build

# Standalone build artifacts need these
# (In a real production environment, we'd use 'next start' or standalone)
EXPOSE 3000

CMD ["npm", "start"]
