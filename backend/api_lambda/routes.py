from flask import Flask, jsonify, request
import os
import json
import logging
import awsgi
import traceback
ENV = os.environ.get('ENVIRONMENT', 'dev')

# Configure basic logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s %(levelname)s %(name)s %(threadName)s : %(message)s'
)

logger = logging.getLogger()
logger.setLevel(logging.INFO)

app = Flask(__name__)

def lambda_handler(event, context):
    logger.info(f"Received event: {json.dumps(event)}")
    try:
        logger.info("Attempting to process with awsgi")
        response = awsgi.response(app, event, context)
        logger.info(f"AWSGI response: {json.dumps(response)}")
        return response
    except Exception as e:
        logger.error(f"Error in lambda_handler: {str(e)}")
        logger.error(traceback.format_exc())
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)}),
            "headers": {"Content-Type": "application/json"}
        }

@app.route(f"/{ENV}/")
def hello_world():
    logger.info("Default route accessed")
    return "<p>default route</p>"

@app.route(f"/{ENV}/health")
def health_check():
    logger.info("Health check endpoint accessed")
    return jsonify({"status": "healthy"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 80)))
