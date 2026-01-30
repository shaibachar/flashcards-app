FROM python:3.11-slim

# Install system dependencies for pydub and audio processing
RUN apt-get update && apt-get install -y \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
ENV PIPENV_VENV_IN_PROJECT=1

# Copy and install Python dependencies
COPY Pipfile* ./
RUN pip install --no-cache-dir pipenv && \
    pipenv install --system --verbose && \
    pip list

COPY app ./app
COPY jwt_fallback.py ./jwt_fallback.py
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "80", "--log-level", "debug"]
