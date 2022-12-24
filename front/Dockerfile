FROM node:16.19-slim as build
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY react/package.json ./
COPY react/yarn.lock ./
RUN yarn
COPY react/ ./
RUN yarn run build

FROM ubuntu:20.04
RUN apt-get update && apt-get install -y nginx && rm -rf /var/lib/apt/lists/*
COPY --from=build /app/build /var/www/html
COPY nginx/nginx.conf /etc/nginx/sites-enabled/default
RUN sed -i 's#/var/log/nginx/access.log#/dev/stdout#' /etc/nginx/nginx.conf && \
    sed -i 's#/var/log/nginx/error.log#/dev/stderr#' /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
