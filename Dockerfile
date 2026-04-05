FROM node:20-bookworm-slim AS deps
WORKDIR /app

COPY package.json package-lock.json ./
COPY webapp/package.json ./webapp/package.json
COPY server/package.json ./server/package.json

RUN npm ci --include=dev

FROM deps AS build
WORKDIR /app

COPY . .

RUN npm run build

FROM node:20-bookworm-slim AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

COPY package.json package-lock.json ./
COPY webapp/package.json ./webapp/package.json
COPY server/package.json ./server/package.json

RUN npm ci --omit=dev

COPY --from=build /app/server ./server
COPY --from=build /app/webapp/dist ./webapp/dist

EXPOSE 8080

CMD ["npm", "start"]
