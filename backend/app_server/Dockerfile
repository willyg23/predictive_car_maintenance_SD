FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 80

CMD ["python", "app.py"]

# steps to dockerize:
#aws ecr get-login-password --region us-east-2 | docker login --username AWS --password-stdin 273354637937.dkr.ecr.us-east-2.amazonaws.com
#sudo  docker build -t sd-app-server .
#docker tag sd-app-server:latest 273354637937.dkr.ecr.us-east-2.amazonaws.com/dev-dev_ecr:latest
#docker push 273354637937.dkr.ecr.us-east-2.amazonaws.com/dev-dev_ecr:latest