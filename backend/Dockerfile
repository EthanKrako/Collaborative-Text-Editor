FROM node:24-alpine as base
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

FROM base AS dev
EXPOSE 3000
CMD ["npm", "run", "start:dev"]

FROM base AS build
RUN npm run build

FROM node:24-alpine AS prod
WORKDIR /app
COPY --from=build /app/dist ./dist
EXPOSE 3000
CMD ["npm", "run", "start:prod"]