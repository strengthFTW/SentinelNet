FROM python:3.11-slim-buster

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

# Install python dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Install python-multipart (required for FastAPI upload)
RUN pip install --no-cache-dir python-multipart

COPY . .

EXPOSE 8000

ENV PORT=8000

CMD ["python", "app.py"]