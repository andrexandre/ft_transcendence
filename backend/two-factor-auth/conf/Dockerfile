FROM node

EXPOSE 3500

WORKDIR /backend

COPY ./setup.sh /bin/
RUN chmod 777 /bin/setup.sh

ENTRYPOINT [ "/bin/setup.sh" ]

CMD [ "npm", "run", "start" ]