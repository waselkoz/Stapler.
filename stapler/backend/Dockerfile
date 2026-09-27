FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy pyproject.toml and install dependencies
COPY pyproject.toml .
RUN pip install --no-cache-dir fastapi uvicorn playwright python-dotenv httpx prometheus-client vaderSentiment beautifulsoup4 pydantic

# Install playwright browsers
RUN playwright install --with-deps chromium

# Copy the rest of the application
COPY . .

EXPOSE 313

CMD ["python", "main.py"]
