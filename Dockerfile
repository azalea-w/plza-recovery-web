FROM node:18-alpine AS frontend-build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM python:3.13-slim-bookworm

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

COPY --from=frontend-build /app/dist ./dist
COPY --from=frontend-build /app/plza-recovery ./plza-recovery
COPY requirements.txt .
COPY server.py .

RUN pip install --no-cache-dir -r requirements.txt


EXPOSE 8000

CMD ["python", "server.py"]