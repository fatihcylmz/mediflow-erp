# Frontend Dockerfile for MediFlow Healthcare ERP
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["npx", "next", "start", "-p", "3000"]