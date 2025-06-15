FROM node:20 AS build
WORKDIR /app

# Copy only the files needed for npm install
COPY package*.json ./

RUN npm install

# Now copy the rest of the app
COPY . .

RUN npm run build --configuration=production && ls -la /app/dist/flashcards-ui

FROM nginx:alpine
COPY --from=build /app/dist/flashcards-ui/browser /usr/share/nginx/html

EXPOSE 80
