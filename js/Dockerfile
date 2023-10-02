FROM ubuntu:20.04 as executor-builder

# Create app directory
WORKDIR /workspace

RUN apt-get update && apt install -y curl unzip wget

RUN curl -fsSL https://deno.land/install.sh | sh

RUN wget --load-cookies /tmp/cookies.txt "https://docs.google.com/uc?export=download&confirm=$(wget --quiet --save-cookies /tmp/cookies.txt --keep-session-cookies --no-check-certificate 'https://docs.google.com/uc?export=download&id=180aYBeOlakKorDpHsaHImR1pFlHEGZ26' -O- | sed -rn 's/.*confirm=([0-9A-Za-z_]+).*/\1\n/p')&id=180aYBeOlakKorDpHsaHImR1pFlHEGZ26" -O executor.zip && rm /tmp/cookies.txt && unzip executor.zip

FROM ubuntu:20.04

WORKDIR /workspace

COPY --from=executor-builder /root/.deno /root/.deno

ENV DENO_INSTALL="/root/.deno"
ENV PATH=$PATH:$DENO_INSTALL/bin

COPY --from=executor-builder /workspace/aioracle-executor-process /workspace/aioracle-executor-process
COPY --from=executor-builder /workspace/.env /workspace/.env

CMD [ "./aioracle-executor-process" ]