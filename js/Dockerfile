FROM ubuntu:20.04

# Create app directory
WORKDIR /workspace

RUN apt-get update && apt install -y curl

RUN curl -fsSL https://deno.land/install.sh | sh

ENV DENO_INSTALL="/root/.deno"
ENV PATH=$PATH:$DENO_INSTALL/bin

RUN apt install unzip nano wget