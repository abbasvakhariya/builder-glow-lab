FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
COPY . .
RUN npm install --production
CMD ["node", "dist/server.js"]
