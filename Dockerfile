# Remote (HTTP) deployment of the Malipo MCP server, for use as a Claude connector.
FROM node:22-alpine AS build
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY tsconfig.json ./
COPY src ./src
RUN pnpm build

FROM node:22-alpine
WORKDIR /app
RUN corepack enable
ENV NODE_ENV=production
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod
COPY --from=build /app/dist ./dist
# Run as the unprivileged `node` user that the base image provides.
USER node
# PORT, MCP_AUTH_TOKEN and MALIPO_TENANT_ID are provided at runtime.
EXPOSE 3000
CMD ["node", "dist/http.js"]
