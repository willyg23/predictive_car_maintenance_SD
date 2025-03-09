FROM public.ecr.aws/lambda/python:3.9-arm64

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 80

ENV PORT=80

CMD [ "routes.lambda_handler" ]

# steps to dockerize:
    # - aws ecr get-login-password --region us-east-2 | docker login --username AWS --password-stdin 273354637937.dkr.ecr.us-east-2.amazonaws.com
    # - docker buildx build --no-cache --platform linux/amd64 -t api-lambda-image:api-lambda-latest .
    #     - for no cache, run: docker buildx build --no-cache --platform linux/amd64 -t api-lambda-image:api-lambda-latest .
    # - docker tag api-lambda-image:api-lambda-latest 273354637937.dkr.ecr.us-east-2.amazonaws.com/dev-dev_ecr:api-lambda-latest
    # - docker push 273354637937.dkr.ecr.us-east-2.amazonaws.com/dev-dev_ecr:api-lambda-latest