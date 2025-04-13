import datetime
import random
import string
import uuid
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
DB_USER = os.environ.get('DB_USERNAME')
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
    logger.info(f"Attempting to connect to DB at {DB_HOST}:{DB_PORT}")
    logger.info(f"DB_NAME: {DB_NAME}, DB_USER: {DB_USER}")
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
        return jsonify({"status": "error", "message": str(e)}), 500 # does and should this default to 500?

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 80)))

# get all cars and car data for a user given a uuid stuff
@app.route(f"/{ENV}/user/<uuid:user_uuid>/cars", methods=['GET'])
def get_user_cars(user_uuid):
    logger.info(f"Getting cars for user: {user_uuid}")
    try:
        cars = get_user_cars_details(user_uuid)
        return jsonify({"status": "success", "data": cars})
    except Exception as e:
        logger.error(f"Error in get_user_cars endpoint: {str(e)}")
        return jsonify({"status": "error", "message": str(e)}), 500

def get_user_cars_details(user_uuid):
    """Retrieve all cars and their details for a specific user UUID."""
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # SQL query to join cars and car_details tables for a specific user
        query = """
            SELECT c.car_id, cd.detail_id, cd.make, cd.model, cd.year, cd.mileage, 
                   cd.last_maintenance_checkup, cd.last_oil_change, cd.purchase_date, 
                   cd.last_brake_pad_change
            FROM cars c
            LEFT JOIN car_details cd ON c.car_id = cd.car_id
            WHERE c.user_uuid = %s
        """
        
        cursor.execute(query, (user_uuid,))
        
        # Fetch all results
        results = cursor.fetchall()
        
        # Format the results
        cars = []
        for row in results:
            car = {
                "car_id": row[0],
                "detail_id": row[1],
                "make": row[2],
                "model": row[3],
                "year": row[4],
                "mileage": row[5],
                "last_maintenance_checkup": row[6].isoformat() if row[6] else None,
                "last_oil_change": row[7].isoformat() if row[7] else None,
                "purchase_date": row[8].isoformat() if row[8] else None,
                "last_brake_pad_change": row[9].isoformat() if row[9] else None
            }
            cars.append(car)
        
        logger.info(f"Retrieved {len(cars)} cars for user {user_uuid}")
        return cars
    except Exception as e:
        logger.error(f"Error retrieving cars for user {user_uuid}: {str(e)}")
        raise
    finally:
        if conn:
            conn.close()

# Create fake user route stuff
@app.route(f"/{ENV}/create_fake_user", methods=['POST'])
def create_fake_user_endpoint():
    logger.info("Create fake user endpoint accessed")
    try:
        user_uuid = create_fake_user_data()
        logger.info(f"Fake user created with UUID: {user_uuid}")
        return jsonify({"status": "success", "message": "Fake user data created", "user_uuid": user_uuid})
    except Exception as e:
        logger.error(f"Error in create_fake_user endpoint: {str(e)}")
        return jsonify({"status": "error", "message": str(e)}), 500

def create_fake_user_data():
    """Generate and store random fake data for a user, their cars, and car details."""
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Generate fake user data
        user_uuid = uuid.uuid4()
        email = f"{''.join(random.choices(string.ascii_lowercase, k=8))}@example.com"
        location = random.choice(["New York", "Los Angeles", "Chicago", "Houston", "Phoenix"])
        
        # Insert user into database
        cursor.execute(
            "INSERT INTO users (uuid, email, location) VALUES (%s, %s, %s)",
            (user_uuid, email, location)
        )
        
        # Generate random number of cars (1-3)
        num_cars = random.randint(1, 3)
        car_ids = []
        
        for _ in range(num_cars):
            # Insert car into database
            cursor.execute(
                "INSERT INTO cars (user_uuid) VALUES (%s) RETURNING car_id",
                (user_uuid,)
            )
            car_id = cursor.fetchone()[0]
            car_ids.append(car_id)
            
            # Generate fake car details
            make = random.choice(["Toyota", "Ford", "Honda", "Chevrolet", "Nissan"])
            model = random.choice(["Corolla", "F-150", "Civic", "Silverado", "Altima"])
            year = random.randint(2000, 2023)
            mileage = random.randint(0, 200000)
            
            # Generate random dates
            last_maintenance_checkup = datetime.now() - datetime.timedelta(days=random.randint(30, 365))
            last_oil_change = datetime.now() - datetime.timedelta(days=random.randint(30, 180))
            purchase_date = datetime.now() - datetime.timedelta(days=random.randint(365, 3650))
            last_brake_pad_change = datetime.now() - datetime.timedelta(days=random.randint(30, 365))
            
            # Insert car details into database
            cursor.execute(
                """
                INSERT INTO car_details 
                (car_id, make, model, year, mileage, last_maintenance_checkup, 
                last_oil_change, purchase_date, last_brake_pad_change)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                """,
                (car_id, make, model, year, mileage, last_maintenance_checkup,
                 last_oil_change, purchase_date, last_brake_pad_change)
            )
        
        # Commit the transaction
        conn.commit()
        logger.info(f"Created user with UUID {user_uuid} and {num_cars} cars")
        return user_uuid
    except Exception as e:
        logger.error(f"Error creating fake user data: {str(e)}")
        if conn:
            conn.rollback()
        raise
    finally:
        if conn:
            conn.close()
