FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci
COPY server/package.json server/package-lock.json ./server/
RUN cd server && npm ci --legacy-peer-deps
COPY . .
RUN npm run build && npm --prefix server run build

FROM node:22-alpine AS production
ENV NODE_ENV=production PORT=2567
WORKDIR /app
COPY server/package.json server/package-lock.json ./server/
RUN cd server && npm ci --omit=dev --legacy-peer-deps && npm cache clean --force
COPY --from=build /app/dist ./dist
COPY --from=build /app/server/dist ./server/dist
WORKDIR /app/server
EXPOSE 2567
CMD ["node", "dist/index.js"]
