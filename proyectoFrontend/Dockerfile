# Cambiamos node:18 por node:20 para que sea más cercano a tu versión local
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build --configuration=production

FROM nginx:alpine
# Copiamos nuestra configuración de Nginx para soportar rutas de Angular (SPA)
COPY nginx.conf /etc/nginx/conf.d/default.conf
# IMPORTANTE: Los builders modernos de Angular sacan todo a /browser
COPY --from=build /app/dist/proyectoFrontend/browser /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]