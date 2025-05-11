FROM node:20 AS build
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build --configuration=production

FROM nginx:alpine
COPY --from=build /app/dist/flashcards-ui /usr/share/nginx/html
EXPOSE 80
