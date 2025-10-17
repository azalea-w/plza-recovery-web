FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm i

COPY . .

RUN npm run build

FROM python:3.13.9-slim-bookwork

RUN pip install -r requirements.txt

EXPOSE 8000

CMD ["python", "server.py"]