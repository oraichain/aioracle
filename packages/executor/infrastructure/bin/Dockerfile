FROM ubuntu:23.04

WORKDIR /workspace

RUN apt update && \
  apt install -y curl unzip && \
  curl -fsSL https://deno.land/install.sh | sh
ENV DENO_INSTALL="/root/.deno"
ENV PATH=$PATH:$DENO_INSTALL/bin

COPY ./executor-ts-linux ./executor_run
RUN chmod +x ./executor_run

CMD ["./executor_run"]
