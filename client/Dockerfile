FROM node:16-alpine3.15 as build
# ENV NODE_ENV production
LABEL version="1.0"
LABEL description="This is the base docker image for handshake's frontend application."
LABEL maintainer = ["julianrajman@gmail.com"]

WORKDIR /app

COPY ["package.json", "./"]

RUN npm install

COPY . ./

RUN npm run build:prod


# production environment
FROM nginx:1.19.10-alpine
COPY --from=build /app/dist/client /usr/share/nginx/html

COPY --from=build /app/nginx/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
EXPOSE 443
CMD ["nginx", "-g", "daemon off;"]