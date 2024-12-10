FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 80

ENV PORT=80
ENV OPENAI_API_KEY=placeholder
# ^add api key when you dockerize, but turn back to "placeholder" when you commit code to github


CMD ["python", "routes.py"]


# steps to dockerize:
#aws ecr get-login-password --region us-east-2 | docker login --username AWS --password-stdin 273354637937.dkr.ecr.us-east-2.amazonaws.com
#sudo  docker build -t sd-app-server .
#docker tag sd-app-server:latest 273354637937.dkr.ecr.us-east-2.amazonaws.com/dev-dev_ecr:latest
#docker push 273354637937.dkr.ecr.us-east-2.amazonaws.com/dev-dev_ecr:latest