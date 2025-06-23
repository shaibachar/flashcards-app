FROM python:3.11-slim

WORKDIR /app
ENV PIPENV_VENV_IN_PROJECT=1
COPY Pipfile* ./
RUN pip install --no-cache-dir pipenv && \
    pipenv install --deploy --system

COPY app ./app
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "80"]
