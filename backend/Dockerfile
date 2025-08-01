# backend/Dockerfile

# 1) Install dependencies only
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --production

# 2) Build final image
FROM node:20-alpine AS runner
WORKDIR /app

# Copy just production deps
COPY --from=deps /app/node_modules ./node_modules

# Copy source
COPY . .

# If you have a build step (e.g. transpilation), run it here:
# RUN npm run build

# Use a non-root user if you like
# RUN addgroup -S app && adduser -S app -G app
# USER app

ENV NODE_ENV=production
EXPOSE 5000

# Start the server
CMD ["node", "server.js"]
