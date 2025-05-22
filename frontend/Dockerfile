FROM node:slim

COPY package.json package-lock.json ./

# FROM node:slim AS build

# WORKDIR /frontend
# COPY ./ /frontend/
# RUN npm config set fund false && npm config set update-notifier false
# RUN npm install && npm audit fix && npm run build

# FROM nginx:alpine

# COPY nginx.conf /etc/nginx/conf.d/default.conf
# COPY --from=build /frontend/dist /usr/share/nginx/html

# EXPOSE 80
