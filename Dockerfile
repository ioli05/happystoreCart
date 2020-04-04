FROM node:stretch-slim

WORKDIR /usr/cart

COPY *.json ./
COPY *.js ./

RUN npm install
EXPOSE 5002

CMD ["node", "cart-server.js"]
