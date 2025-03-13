FROM node

WORKDIR /frontend

COPY package.json package-lock.json .

RUN npm install

EXPOSE 5500

CMD [ "npm", "run", "dev" ]
