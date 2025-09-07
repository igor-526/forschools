FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY tsconfig.json ./
COPY vite.config.ts ./
RUN npm ci
COPY . .
COPY .env.vite .env
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]