FROM node:23.5-alpine AS build

WORKDIR /home/node/app

COPY --chown=node:node package*.json .
COPY --chown=node:node tsconfig*.json .

RUN npm install

COPY --chown=node:node . .

RUN npm run build

FROM node:23.5-alpine AS production

WORKDIR /home/node/app

COPY --chown=node:node package*.json .

RUN npm ci --omit=dev

COPY --chown=node:node --from=build /home/node/app/dist ./src

RUN chown -R node:node /home/node/app

USER node

EXPOSE 8080

CMD [ "node", "src/app.js"]