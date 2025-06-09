
# FROM node:alpine
FROM nginx:latest

EXPOSE 443

RUN apt update && apt install -y openssl

RUN mkdir -p /etc/nginx/ssl && \
	openssl req -newkey rsa:4096 -x509 -sha256 -days 365 -nodes \
	-keyout /etc/nginx/ssl/server.key \
	-out /etc/nginx/ssl/server.crt \
	-subj "/C=PT/ST=Lisbon/L=Lisbon/O=42Lisboa/OU=ft_transcendence/CN=localhost/"

RUN chmod 777  /etc/nginx/ssl/server.key /etc/nginx/ssl/server.crt

# The instruction that is to be executed when a docker container starts
# There can only one 'CMD' in the dockerfile and it should be the last parameter 
CMD	["nginx", "-g", "daemon off;"]`