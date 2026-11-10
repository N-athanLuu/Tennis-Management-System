FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY src/ src/
CMD ["flask", "--app", "src/app.py", "run", "--host=0.0.0.0", "--debug"]