FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Vite defaults to port 5173
EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]
