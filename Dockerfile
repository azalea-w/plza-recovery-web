FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm i

COPY . .

RUN npm run build

FROM python:3.13.9-slim-bookworm

WORKDIR /app

COPY --from=build . .

RUN pip install -r app/requirements.txt

EXPOSE 8000

CMD ["python", "app/server.py"]