FROM node:20.17.0-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# 设置启动脚本权限
RUN chmod +x /app/docker-entrypoint.sh

EXPOSE 2533

ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["npm", "run", "prod"]