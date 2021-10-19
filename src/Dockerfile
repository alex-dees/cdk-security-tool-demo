FROM 901796084209.dkr.ecr.us-east-1.amazonaws.com/node:14
#FROM 901796084209.dkr.ecr.us-east-1.amazonaws.com/node:16-alpine3.14
WORKDIR /usr/src/app
COPY package*.json app.js ./
RUN npm install
EXPOSE 80
CMD ["node", "app.js"]