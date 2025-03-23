from flask import Flask, jsonify, request
import os
import json
import logging
import awsgi
import traceback
import psycopg2
from sql_queries import CREATE_SCHEMA

ENV = os.environ.get('ENVIRONMENT')

# Configure basic logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s %(levelname)s %(name)s %(threadName)s : %(message)s'
)

logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Database configuration
DB_HOST = "terraform-20250323164944761200000005.cnqq0meu6lwj.us-east-2.rds.amazonaws.com" # can change if the database is destroyed and re-deployed
DB_NAME = "dev_db"
DB_USER = os.environ.get('DB_USER')
DB_PASSWORD = os.environ.get('DB_PASSWORD')
DB_PORT = 5432

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

def get_db_connection():
    """Establish and return a connection to the database."""
    try:
        conn = psycopg2.connect(
            host=DB_HOST,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
            port=DB_PORT
        )
        return conn
    except Exception as e:
        logger.error(f"Database connection error: {str(e)}")
        raise

def create_schema():
    """Create the database schema if it doesn't exist."""
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Execute the entire schema as one statement
        cursor.execute(CREATE_SCHEMA)
        
        # Commit the transaction
        conn.commit()
        logger.info("Database schema created successfully")
        return True
    except Exception as e:
        logger.error(f"Error creating schema: {str(e)}")
        if conn:
            conn.rollback()
        raise
    finally:
        if conn:
            conn.close()

@app.route(f"/{ENV}/")
def hello_world():
    logger.info("Default route accessed")
    return "<p>default route</p>"

@app.route(f"/{ENV}/health", methods=['GET'])
def health_check():
    logger.info("Health check endpoint accessed")
    return jsonify({"status": "healthy"})

@app.route(f"/{ENV}/create_db_schema", methods=['POST'])
def db_create_schema():
    logger.info("Create schema endpoint accessed")
    logger.info(f"DB username env variable: {DB_USER}")
    logger.info(f"DB password env variable: {DB_PASSWORD}")
    try:
        create_schema()
        return jsonify({"status": "success", "message": "Database schema created"})
    except Exception as e:
        logger.error(f"Error in create_schema endpoint: {str(e)}")
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 80)))
