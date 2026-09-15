FROM node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache openssl libc6-compat
COPY package.json package-lock.json ./
COPY backend/package.json ./backend/package.json
COPY frontend/package.json ./frontend/package.json
RUN npm ci --workspace backend --include-workspace-root=false
COPY backend ./backend
WORKDIR /app/backend
RUN npm run prisma:generate && npm run build

FROM node:20-alpine AS runner
WORKDIR /app
RUN apk add --no-cache openssl libc6-compat
ENV NODE_ENV=production
COPY package.json package-lock.json ./
COPY backend/package.json ./backend/package.json
COPY frontend/package.json ./frontend/package.json
COPY backend/prisma ./backend/prisma
RUN npm ci --omit=dev --workspace backend --include-workspace-root=false
WORKDIR /app/backend
RUN npm run prisma:generate
COPY --from=builder /app/backend/dist ./dist
RUN mkdir -p uploads && chown -R node:node uploads
USER node
EXPOSE 5000
CMD ["npm", "start"]
