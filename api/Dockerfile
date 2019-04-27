FROM node:slim

WORKDIR /api_forecast

COPY . /api_forecast
RUN npm install

EXPOSE 8080
CMD ["npm", "start"]
