FROM node:24-alpine as base
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

FROM base AS dev
EXPOSE 4200
CMD ["npm", "start"]

FROM base AS build
RUN npm run build

FROM nginx:alpine AS prod
COPY --from=build /app/dist/collaborative-text-editor /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]