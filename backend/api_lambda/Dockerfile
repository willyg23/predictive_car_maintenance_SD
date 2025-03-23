FROM public.ecr.aws/lambda/python:3.12-arm64

# Copy requirements and install dependencies
COPY requirements.txt ${LAMBDA_TASK_ROOT}/
RUN pip install -r ${LAMBDA_TASK_ROOT}/requirements.txt

# Copy function code to the correct location
COPY code_and_queries/* ${LAMBDA_TASK_ROOT}/

# Command can be passed to the runtime
CMD [ "routes.lambda_handler" ]

# steps to dockerize:
    # run these commands in the /backend/api_lambda dir
    # - aws ecr get-login-password --region us-east-2 | docker login --username AWS --password-stdin 273354637937.dkr.ecr.us-east-2.amazonaws.com
    # - docker buildx build --platform linux/arm64 --provenance=false -t api-lambda-image:api-lambda-latest .
    #     - for no cache, run: docker buildx build --no-cache --platform linux/arm64 --provenance=false -t api-lambda-image:api-lambda-latest .
    # - docker tag api-lambda-image:api-lambda-latest 273354637937.dkr.ecr.us-east-2.amazonaws.com/dev-dev_ecr:api-lambda-latest
    # - docker push 273354637937.dkr.ecr.us-east-2.amazonaws.com/dev-dev_ecr:api-lambda-latest
# how to run the container locally
    # run the container normally in detached mode
    # docker run -d -p 9000:8080 --name api-lambda-local-container api-lambda-image:api-lambda-latest

# how to get into the container running locally
    # get a shell inside the running container
    # docker exec -it api-lambda-local-container bash

# how stop the container running locally
    # docker stop api-lambda-local-container