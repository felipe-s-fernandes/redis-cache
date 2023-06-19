FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

ARG PORT=3000
ENV PORT=$PORT
EXPOSE $PORT

CMD ["npm", "run", "dev"]
EXPOSE 3000
