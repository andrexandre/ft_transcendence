FROM node

# Install SQLite
RUN apt-get update && apt-get install -y sqlite3 \
    && rm -rf /var/lib/apt/lists/*

# Copy game
COPY setup.sh /bin/
RUN chmod 777 /bin/setup.sh

WORKDIR /pong_vol/game-project

EXPOSE 3000

ENTRYPOINT [ "/bin/setup.sh"]

CMD ["npm", "run", "watch"] 

# dev / start
