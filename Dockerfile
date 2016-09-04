FROM alpine:3.4
MAINTAINER Markus Wunderlin <markus@sonium.org>

RUN apk --no-cache add nodejs python make g++ git
RUN mkdir -p /app
WORKDIR /app

ADD package.json /app/
RUN npm install
RUN npm cache clean
COPY . /app/
RUN apk del python make g++ git
RUN rm -rf /var/cache/apk/*

CMD ["npm","test"]
