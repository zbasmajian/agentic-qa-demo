# ---- Stage 1: build ----
# Installs all dependencies (including dev ones like TypeScript and Tailwind)
# and runs `next build`. Nothing from this stage ships except the build output.
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- Stage 2: runtime ----
# Next.js "standalone" output (turned on in next.config.ts) puts a minimal
# server.js plus only the node_modules it needs in .next/standalone,
# so this stage needs no `npm ci` at all.
FROM node:22-alpine
WORKDIR /app
# HOSTNAME=0.0.0.0 makes the server listen on all interfaces, so traffic from
# outside the container (Docker port mapping, the Kubernetes Service) reaches it.
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0
# The standalone server, and the static assets and public files it serves
# (standalone doesn't include those two folders, so copy them in).
# --chown lets the non-root `node` user write Next.js's cache under .next/.
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public
USER node
EXPOSE 3000
CMD ["node", "server.js"]
