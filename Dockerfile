FROM node:20-bookworm-slim AS build
WORKDIR /app

ENV NODE_ENV=development
ENV NPM_CONFIG_PRODUCTION=false
ENV npm_config_production=false

COPY webapp/package.json ./webapp/package.json
COPY webapp ./webapp

RUN npm install --prefix ./webapp --include=dev
RUN npm run build --prefix ./webapp

FROM node:20-bookworm-slim AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

COPY server/package.json ./server/package.json

RUN npm install --prefix ./server --omit=dev

COPY server ./server
COPY --from=build /app/webapp/dist ./webapp/dist

EXPOSE 8080

CMD ["node", "server/index.js"]
