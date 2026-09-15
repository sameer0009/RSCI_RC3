FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
COPY backend/package.json ./backend/package.json
COPY frontend/package.json ./frontend/package.json
RUN npm ci --workspace frontend --include-workspace-root=false
COPY frontend ./frontend
WORKDIR /app/frontend
ARG NEXT_PUBLIC_API_URL=http://localhost:5000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN mkdir -p node_modules && npm run build

FROM node:20-alpine AS runner
WORKDIR /app/frontend
ENV NODE_ENV=production
COPY --from=builder --chown=node:node /app/node_modules /app/node_modules
COPY --from=builder --chown=node:node /app/frontend/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/frontend/next.config.js ./
COPY --from=builder --chown=node:node /app/frontend/public ./public
COPY --from=builder --chown=node:node /app/frontend/.next ./.next
COPY --from=builder --chown=node:node /app/frontend/package.json ./package.json
USER node
EXPOSE 3000
CMD ["npm", "start"]
