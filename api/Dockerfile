FROM node:slim

WORKDIR /api_forecast

COPY . /api_forecast
RUN npm install

EXPOSE 80
CMD ["npm", "start"]
