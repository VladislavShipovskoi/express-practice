FROM node:22-alpine
WORKDIR /app
ARG NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
CMD ["node", "index.js"]