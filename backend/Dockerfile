FROM python:3.9-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code
COPY . .

# Expose the port from the environment variable
EXPOSE ${BACKEND_PORT}

# Run the Quart app with the port from the environment variable
CMD ["python", "app.py"]
