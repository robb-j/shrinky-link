# Use a node alpine image install packages and run the start script
FROM node:10-alpine
WORKDIR /app
VOLUME /app/logs
EXPOSE 3000
COPY ["package.json", "package-lock.json", "/app/"]
RUN npm ci --production > /dev/null
COPY web /app/web
ENTRYPOINT [ "npm" ]
CMD [ "start", "-s" ]
