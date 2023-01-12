FROM node:16.15.1 AS Builder

WORKDIR /workspace

RUN apt update -y && apt install -y curl unzip
COPY ./yarn.lock ./package.json ./
RUN yarn install
COPY . .
RUN curl -fsSL https://deno.land/install.sh | sh
ENV DENO_INSTALL="/root/.deno"
ENV PATH=$PATH:$DENO_INSTALL/bin
CMD ["yarn", "start"]
