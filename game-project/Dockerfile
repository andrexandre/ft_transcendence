FROM node

COPY setup.sh /bin/
RUN chmod 777 /bin/setup.sh

WORKDIR /pong_vol/game-project

EXPOSE 3000

ENTRYPOINT [ "/bin/setup.sh"]

CMD ["npm", "run", "watch"] 

# dev / start
