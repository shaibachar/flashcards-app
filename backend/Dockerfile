FROM python:3.11-slim

# Install system dependencies for pydub and audio processing
RUN apt-get update && apt-get install -y \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy and install Python dependencies using requirements.txt
COPY requirements.txt ./
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Verify TTS packages are installed
RUN python -c "import gtts; import pypdf; import langdetect; from pydub import AudioSegment; print('All TTS dependencies installed successfully!')"

COPY app ./app
COPY jwt_fallback.py ./jwt_fallback.py

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "80", "--log-level", "debug"]
