FROM python:3.10-slim

WORKDIR /code

# Set PYTHONPATH so 'app' folder is always found
ENV PYTHONPATH=/code

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy everything (including app/ folder and app_entry.py)
COPY . .

# Hugging Face permissions
RUN useradd -m -u 1000 user && \
	chown -R user:user /code
USER user
ENV HOME=/home/user \
	PATH=/home/user/.local/bin:$PATH

EXPOSE 7860

# Run using the new root-level entry point
CMD ["uvicorn", "app_entry:app", "--host", "0.0.0.0", "--port", "7860"]
