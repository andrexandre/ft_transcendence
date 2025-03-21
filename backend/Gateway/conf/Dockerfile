FROM node

EXPOSE 7000

COPY ./setup.sh /bin/
RUN chmod 777 /bin/setup.sh
RUN apt update && \
	apt install -y sqlite3 && \
	rm -rf /var/lib/apt/lists/*

WORKDIR /backend

ENTRYPOINT [ "/bin/setup.sh" ]

CMD [ "npm" , "run", "dev"]
# CMD ["tail", "-f", "/dev/null"]
# docker system df ve o tamanho total de tudo que o docker usa imagens volume cache