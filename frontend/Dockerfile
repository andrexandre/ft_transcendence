# FROM node:slim

# COPY package.json package-lock.json ./


FROM node:slim AS build

WORKDIR /frontend
COPY ./ /frontend/
RUN npm config set fund false && npm config set update-notifier false
RUN npm install && npm audit fix && npm run build

FROM nginx:alpine

# Instalar openssl no Alpine
RUN apk add --no-cache openssl

# Copiar config do NGINX
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar build do frontend
COPY --from=build /frontend/dist /usr/share/nginx/html

# Gerar certificados autoassinados
RUN mkdir -p /etc/nginx/ssl && \
	openssl req -newkey rsa:4096 -x509 -sha256 -days 365 -nodes \
	-keyout /etc/nginx/ssl/server.key \
	-out /etc/nginx/ssl/server.crt \
	-subj "/C=PT/ST=Lisbon/L=Lisbon/O=42Lisboa/OU=ft_transcendence/CN=localhost/"

RUN chmod 777 /etc/nginx/ssl/server.key /etc/nginx/ssl/server.crt

EXPOSE 8008
