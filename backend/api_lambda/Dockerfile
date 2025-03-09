FROM public.ecr.aws/lambda/python:3.9-arm64

# Copy requirements and install dependencies
COPY requirements.txt ${LAMBDA_TASK_ROOT}/
RUN pip install -r ${LAMBDA_TASK_ROOT}/requirements.txt

# Copy function code to the correct location
COPY routes.py ${LAMBDA_TASK_ROOT}/

# Command can be passed to the runtime
CMD [ "routes.lambda_handler" ]

# steps to dockerize:
    # run these commands in the /backend/api_lambda dir
    # - aws ecr get-login-password --region us-east-2 | docker login --username AWS --password-stdin 273354637937.dkr.ecr.us-east-2.amazonaws.com
    # - docker buildx build --no-cache --platform linux/arm64 --provenance=false -t api-lambda-image:api-lambda-latest .
    #     - for no cache, run: docker buildx build --no-cache --platform linux/arm64 --provenance=false -t api-lambda-image:api-lambda-latest .
    # - docker tag api-lambda-image:api-lambda-latest 273354637937.dkr.ecr.us-east-2.amazonaws.com/dev-dev_ecr:api-lambda-latest
    # - docker push 273354637937.dkr.ecr.us-east-2.amazonaws.com/dev-dev_ecr:api-lambda-latest