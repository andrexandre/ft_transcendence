
FROM node

EXPOSE 2000

RUN apt update && \
	apt install -y sqlite3 && \
	rm -rf /var/lib/apt/lists/*


COPY ./setup.sh /bin/
RUN chmod 777 /bin/setup.sh

WORKDIR /chat

ENTRYPOINT [ "/bin/setup.sh" ]



CMD [ "npm" , "start"]
# CMD ["tail", "-f", "/dev/null"]
# docker system df ve o tamanho total de tudo que o docker usa imagens volume cache