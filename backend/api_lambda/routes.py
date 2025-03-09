from flask import Flask, jsonify, request
import os
import math
import time
from dotenv import load_dotenv
load_dotenv()

app = Flask(__name__)

@app.route("/")
def hello_world():
    return "<p>default route</p>"

@app.route("/health")
def health_check():
    console.log("entering health check function")
    return {
        "isBase64Encoded": False,
        "statusCode": 200,
        "headers": {"Content-Type": "application/json"},
        "body": json.dumps({"status": "healthy"})
    }

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 80)))
    # For local development, change port to 5000 if needed.