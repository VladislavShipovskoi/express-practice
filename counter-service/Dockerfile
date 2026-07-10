FROM node:24.18.0
WORKDIR /app
ARG NODE_ENV=production
COPY ./package*.json ./
RUN npm install
COPY . .
CMD ["npm", "run", "server"]