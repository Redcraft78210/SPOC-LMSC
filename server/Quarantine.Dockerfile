# Dockerfile
FROM alpine:latest

RUN mkdir /quarantine
WORKDIR /quarantine

CMD ["tail", "-f", "/dev/null"]