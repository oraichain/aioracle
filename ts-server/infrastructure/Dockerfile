FROM node:16.15.1 AS Builder

WORKDIR /workspace

RUN apt update -y
COPY ./yarn.lock ./package.json ./
RUN yarn install
COPY . .
RUN yarn prebuild && yarn build

FROM node:16.15.1-alpine
WORKDIR /workspace
COPY --from=Builder /workspace ./
CMD ["yarn", "start:prod"]
