FROM node:20-bookworm-slim AS deps
WORKDIR /app

ENV NODE_ENV=development
ENV NPM_CONFIG_PRODUCTION=false
ENV npm_config_production=false

COPY package.json package-lock.json ./
COPY webapp/package.json ./webapp/package.json
COPY server/package.json ./server/package.json

RUN npm ci --include=dev --workspaces --include-workspace-root

FROM deps AS build
WORKDIR /app

COPY . .

WORKDIR /app/webapp
RUN ../node_modules/.bin/tsc --noEmit
RUN ../node_modules/.bin/vite build
WORKDIR /app
RUN npm run build --workspace server

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
