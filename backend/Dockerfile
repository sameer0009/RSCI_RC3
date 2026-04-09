# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npx prisma generate
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache openssl libc6-compat

COPY package*.json ./
COPY prisma ./prisma
RUN npm install --only=production
RUN npx prisma generate

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/templates ./src/templates

EXPOSE 5000

CMD ["npm", "start"]
