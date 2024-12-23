# Use a lightweight Python image
FROM python:3.9-slim

# Copy the requirements file
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code to the container
COPY . .

# Expose the port FastAPI will run on
EXPOSE 8080

# Command to run your FastAPI application
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8080"]