FROM node

COPY setup.sh /bin/
RUN chmod 777 /bin/setup.sh

WORKDIR /pong_vol/game-project

# COPY package.json package-lock.json ./

# RUN npm install

# RUN npx ts-node server.ts

EXPOSE 3000

ENTRYPOINT [ "/bin/setup.sh"]

CMD ["npm", "run", "dev"]
