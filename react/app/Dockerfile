FROM node:17-alpine

WORKDIR /src/app/react/

COPY package.json package-lock.json .

RUN npm ci
RUN npm i -g react-scripts@5.0.1

# COPY . .

CMD [ "npm", "start" ]