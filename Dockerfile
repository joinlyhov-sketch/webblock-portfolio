# syntax=docker/dockerfile:1

# Keep the final image below 380,000,000 bytes; check after dependency/base updates.
# Run with --read-only, --cap-drop=ALL and no-new-privileges (see README).

FROM node:24-alpine@sha256:8a32c8cf649a49915a66e81e7a609223c708d0adabf288ee3f4077d765542f85 AS build
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm install --global pnpm@12.15.0 \
    && mkdir -p /app && chown node:node /app
WORKDIR /app
USER node

# Install and execute dependency scripts without root privileges.
COPY --chown=node:node package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store,uid=1000,gid=1000 \
    pnpm install --frozen-lockfile --store-dir=/pnpm/store
COPY --chown=node:node . .
RUN pnpm build

FROM node:24-alpine@sha256:8a32c8cf649a49915a66e81e7a609223c708d0adabf288ee3f4077d765542f85 AS runtime-files
WORKDIR /app

# Package managers are unnecessary in the production image.
RUN rm -rf /usr/local/lib/node_modules/npm /usr/local/lib/node_modules/corepack /opt/yarn-* \
    /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/yarn /usr/local/bin/yarnpkg \
    /usr/local/bin/corepack /usr/local/bin/pnpm /usr/local/bin/pnpx

# Root owns the application; the runtime user can only read/execute it.
COPY --from=build --chown=0:0 /app/.next/standalone ./
COPY --from=build --chown=0:0 /app/.next/static ./.next/static
COPY --from=build --chown=0:0 /app/public ./public
RUN chmod -R go-w /app \
    && mkdir -p /app/.next/cache /app/.next/server/route-cache \
    && chown -R 1000:1000 /app/.next/cache /app/.next/server/route-cache

# Copy the prepared filesystem into one layer so deleted package managers and
# permission changes do not retain bytes from the original layers.
FROM scratch AS runtime
COPY --from=runtime-files / /
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=3000
USER 1000:1000
EXPOSE 3000
CMD ["node", "server.js"]
