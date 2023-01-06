FROM node:16.17-bullseye-slim as base
ENV NODE_ENV=production
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*
RUN mkdir /app && chown -R node:node /app
WORKDIR /app
USER node
COPY --chown=node:node package*.json yarn*.lock ./
RUN npm ci --only=production && npm cache clean --force

FROM base as source
COPY --chown=node:node . .

###
## build source runner
###
FROM source as builder
ENV NODE_ENV=production
COPY --from=dev /app/node_modules /app/node_modules
RUN yarn build

###
## run in prod image
###
FROM node:16.17-alpine as prod
RUN apk update
RUN apk add git zip docker openrc
RUN rc-update add docker boot

COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/node_modules /app/node_modules
CMD ["node", "/app/dist/main.js"]
