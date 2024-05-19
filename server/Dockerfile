FROM node:16-alpine3.15 as development

WORKDIR /app

COPY --chown=node:node ["package.json", "package-lock.json", "tsconfig.build.json", "./"]

RUN npm ci

COPY --chown=node:node . .

USER node

FROM node:16-alpine3.15 As build

WORKDIR /app

COPY --chown=node:node --from=development /app/node_modules ./node_modules

COPY --chown=node:node . .

RUN npm run build

ENV NODE_ENV production

RUN npm ci --only=production && npm cache clean --force

USER node

FROM node:16-alpine3.15 As production

COPY --chown=node:node --from=build /app/node_modules ./node_modules
COPY --chown=node:node --from=build /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main"]