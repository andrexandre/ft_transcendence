FROM node:slim AS backend

RUN apt update && \
	apt install -y sqlite3 && \
	rm -rf /var/lib/apt/lists/*

RUN mkdir -p /ssl

COPY ./certificates /ssl

RUN npm config set fund false && npm config set update-notifier false


FROM nginx:latest AS nginx-gateway

EXPOSE 443

RUN apt update && apt install -y openssl

RUN mkdir -p /etc/nginx/ssl

COPY ./certificates /etc/nginx/ssl

RUN chmod 777  /etc/nginx/ssl/server.key /etc/nginx/ssl/server.crt

CMD	["nginx", "-g", "daemon off;"]


FROM node:slim AS build

WORKDIR /frontend
COPY ./frontend /frontend/
RUN npm config set fund false && npm config set update-notifier false
RUN npm install && npm audit fix && npm run build

FROM nginx:alpine AS frontend

# Instalar openssl no Alpine
RUN apk add --no-cache openssl

# Copiar config do NGINX
COPY ./frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Copiar build do frontend
COPY --from=build ./frontend/dist /usr/share/nginx/html

# Gerar certificados autoassinados
RUN mkdir -p /etc/nginx/ssl

COPY ./certificates /etc/nginx/ssl

RUN chmod 777 /etc/nginx/ssl/server.key /etc/nginx/ssl/server.crt

EXPOSE 8008