FROM node:18-alpine as build
WORKDIR /frontend
COPY ./frontend .
RUN npm install --force
RUN npm run build

FROM node:18-alpine as final
WORKDIR /app
COPY server .
COPY --from=build /frontend/build /frontend/build
RUN npm i
EXPOSE 80
CMD ["npm", "start"]