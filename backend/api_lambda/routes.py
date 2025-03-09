from flask import Flask, jsonify, request
import os
import json
import logging
import awsgi

# Configure basic logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s %(levelname)s %(name)s %(threadName)s : %(message)s'
)

app = Flask(__name__)

def lambda_handler(event, context):
    return awsgi.response(app, event, context)

@app.route("/")
def hello_world():
    app.logger.info("Default route accessed")
    return "<p>default route</p>"

@app.route("/health")
def health_check():
    app.logger.info("Health check endpoint accessed")
    return jsonify({"status": "healthy"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 80)))
    # For local development, change port to 5000 if needed.