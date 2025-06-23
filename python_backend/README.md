# Python Backend

This folder contains a Python implementation of the Flashcards API using FastAPI and Qdrant.


## Running tests
```bash
pipenv install --dev
pipenv run pytest
```

## Running locally

```bash
pipenv install --dev
cp .env.dev .env
pipenv run uvicorn app.main:app --reload --port 5000
```

## Environment files

- `.env.dev` - configuration for local development
- `.env.production` - configuration used in production/Docker

Both files expose `QDRANT_HOST` and `QDRANT_PORT` which the application reads on startup.

## Docker

Build and run the container:

```bash
docker build -t flashcards-python-backend .
docker run --env-file .env.production -p 8080:80 flashcards-python-backend
```
