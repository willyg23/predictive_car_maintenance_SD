from datetime import datetime, date, timedelta
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
import psycopg2.extras
from sql_queries import CREATE_SCHEMA

psycopg2.extras.register_uuid()

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
        logger.info("new code has been deployed 2")
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

@app.route(f"/{ENV}/create_fake_user", methods=['POST'])
def create_fake_user_endpoint():
    logger.info("Create fake user endpoint accessed")
    try:
        # logger.info("new code has been deployed")
        user_uuid = create_fake_user_data()
        logger.info(f"Fake user created with UUID: {user_uuid}")
        # Convert UUID to string explicitly
        user_uuid_str = str(user_uuid) if user_uuid else None
        return jsonify({
            "status": "success", 
            "message": "Fake user data created", 
            "user_uuid": user_uuid_str
        })
    except Exception as e:
        logger.error(f"Error in create_fake_user endpoint: {str(e)}")
        # Convert exception to string to ensure no UUID objects
        error_message = str(e)
        return jsonify({"status": "error", "message": error_message}), 500



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

            # --- FIX IS HERE ---
            # Generate random dates - use timedelta directly
            last_maintenance_checkup = datetime.now() - timedelta(days=random.randint(30, 365))
            last_oil_change = datetime.now() - timedelta(days=random.randint(30, 180))
            purchase_date = datetime.now() - timedelta(days=random.randint(365, 3650))
            last_brake_pad_change = datetime.now() - timedelta(days=random.randint(30, 365))
            # -------------------

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



@app.route(f"/{ENV}/user/<uuid:user_uuid>/car/<int:car_id>", methods=['DELETE'])
def delete_user_car(user_uuid, car_id):
    logger.info(f"Deleting car {car_id} for user: {user_uuid}")
    try:
        result = delete_car_for_user(user_uuid, car_id)
        if result['deleted']:
            return jsonify({"status": "success", "message": f"Car {car_id} successfully deleted"}), 200
        else:
            return jsonify({"status": "error", "message": result['message']}), 404
    except Exception as e:
        logger.error(f"Error in delete_user_car endpoint: {str(e)}")
        return jsonify({"status": "error", "message": str(e)}), 500

def delete_car_for_user(user_uuid, car_id):
    """Delete a specific car for a user if it belongs to them."""
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # First verify that the car belongs to the user
        verify_query = """
            SELECT car_id FROM cars
            WHERE car_id = %s AND user_uuid = %s
        """
        cursor.execute(verify_query, (car_id, user_uuid))
        car = cursor.fetchone()
        
        if not car:
            logger.warning(f"Car {car_id} does not belong to user {user_uuid} or does not exist")
            return {"deleted": False, "message": "Car not found or doesn't belong to this user"}
        
        # Delete the car (cascading delete will remove related records due to ON DELETE CASCADE)
        delete_query = """
            DELETE FROM cars
            WHERE car_id = %s
        """
        cursor.execute(delete_query, (car_id,))
        conn.commit()
        
        logger.info(f"Successfully deleted car {car_id} for user {user_uuid}")
        return {"deleted": True}
    
    except Exception as e:
        if conn:
            conn.rollback()
        logger.error(f"Error deleting car {car_id} for user {user_uuid}: {str(e)}")
        raise
    finally:
        if conn:
            conn.close()

@app.route(f"/{ENV}/user/<uuid:user_uuid>/car/<int:car_id>/details", methods=['PUT'])
def update_car_details(user_uuid, car_id):
    logger.info(f"Updating details for car {car_id} owned by user: {user_uuid}")
    try:
        update_data = request.get_json()
        if not update_data:
            return jsonify({"status": "error", "message": "No update data provided"}), 400
        
        result = update_car_details_for_user(user_uuid, car_id, update_data)
        if not result['updated']:
            return jsonify({"status": "error", "message": result['message']}), 404
        
        return jsonify({"status": "success", "data": result['data']}), 200
    except Exception as e:
        logger.error(f"Error in update_car_details endpoint: {str(e)}")
        return jsonify({"status": "error", "message": str(e)}), 500

def update_car_details_for_user(user_uuid, car_id, update_data):
    """Update car details if the car belongs to the specified user."""
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Verify the car belongs to the user
        cursor.execute("SELECT 1 FROM cars WHERE car_id = %s AND user_uuid = %s", (car_id, user_uuid))
        if not cursor.fetchone():
            return {"updated": False, "message": "Car not found or doesn't belong to this user"}

        # Get allowed fields and filter the update data
        allowed_fields = ['make', 'model', 'year', 'mileage', 'last_maintenance_checkup', 
                          'last_oil_change', 'purchase_date', 'last_brake_pad_change']
        filtered_data = {k: v for k, v in update_data.items() if k in allowed_fields}
        
        if not filtered_data:
            return {"updated": False, "message": "No valid fields to update"}
            
        # Check if car_details record exists
        cursor.execute("SELECT 1 FROM car_details WHERE car_id = %s", (car_id,))
        details_exist = cursor.fetchone()
        
        if details_exist:
            # Update existing record
            set_clause = ", ".join([f"{field} = %s" for field in filtered_data])
            query = f"UPDATE car_details SET {set_clause} WHERE car_id = %s RETURNING *"
            values = list(filtered_data.values()) + [car_id]
        else:
            # Insert new record
            fields = ['car_id'] + list(filtered_data.keys())
            placeholders = ['%s'] * len(fields)
            query = f"INSERT INTO car_details ({', '.join(fields)}) VALUES ({', '.join(placeholders)}) RETURNING *"
            values = [car_id] + list(filtered_data.values())
            
        cursor.execute(query, values)
        result = cursor.fetchone()
        conn.commit()
        
        # Convert to dict and format dates
        columns = [desc[0] for desc in cursor.description]
        data = dict(zip(columns, result))
        for k, v in data.items():
            if isinstance(v, (date, datetime)):
                data[k] = v.isoformat()
                
        return {"updated": True, "data": data}
    
    except Exception as e:
        if conn:
            conn.rollback()
        logger.error(f"Error updating car details: {str(e)}")
        raise
    finally:
        if conn:
            conn.close()



@app.route(f"/{ENV}/user/<uuid:user_uuid>/car/add_user_car", methods=['POST'])
def add_user_car(user_uuid):
    """Endpoint to add a new car for a specific user."""
    logger.info(f"Received request to add car for user: {user_uuid}")
    
    car_data = request.get_json()
    if not car_data:
        logger.warning("Add car request received without JSON body")
        return jsonify({"status": "error", "message": "Missing car data in request body"}), 400

    try:
        result = create_car_for_user(user_uuid, car_data)
        
        if result["created"]:
            logger.info(f"Successfully added car for user {user_uuid}. Car ID: {result['data']['car_id']}")
            # Return 201 Created status code for successful creation
            return jsonify({"status": "success", "message": "Car added successfully", "data": result["data"]}), 201 
        else:
            # Handle specific known errors like 'User not found'
            logger.warning(f"Failed to add car for user {user_uuid}: {result['message']}")
            status_code = 404 if result["message"] == "User not found" else 400
            return jsonify({"status": "error", "message": result["message"]}), status_code

    except Exception as e:
        # Catch unexpected errors from the db operation function
        logger.error(f"Unexpected error in add_user_car endpoint for user {user_uuid}: {str(e)}")
        return jsonify({"status": "error", "message": "An internal error occurred"}), 500
    

def create_car_for_user(user_uuid, car_data):
    """Create a new car and its details for a specific user."""
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # 1. Verify the user exists
        cursor.execute("SELECT 1 FROM users WHERE uuid = %s", (user_uuid,))
        if not cursor.fetchone():
            logger.warning(f"Attempt to add car for non-existent user: {user_uuid}")
            return {"created": False, "message": "User not found"}

        # 2. Insert the new car record to get a car_id
        cursor.execute(
            "INSERT INTO cars (user_uuid) VALUES (%s) RETURNING car_id",
            (user_uuid,)
        )
        car_id = cursor.fetchone()[0]
        logger.info(f"Created new car record with car_id: {car_id} for user {user_uuid}")

        # 3. Prepare and insert the car details
        # Use .get() to handle potentially missing optional fields
        make = car_data.get('make')
        model = car_data.get('model')
        year = car_data.get('year')
        mileage = car_data.get('mileage')
        last_maintenance_checkup = car_data.get('last_maintenance_checkup')
        last_oil_change = car_data.get('last_oil_change')
        purchase_date = car_data.get('purchase_date')
        last_brake_pad_change = car_data.get('last_brake_pad_change')

        details_query = """
            INSERT INTO car_details
            (car_id, make, model, year, mileage, last_maintenance_checkup,
             last_oil_change, purchase_date, last_brake_pad_change)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING * 
        """ # RETURNING * gets the newly created detail record
        cursor.execute(
            details_query,
            (car_id, make, model, year, mileage, last_maintenance_checkup,
             last_oil_change, purchase_date, last_brake_pad_change)
        )
        
        new_details_record = cursor.fetchone()
        conn.commit()

        # Convert the returned record to a dictionary for the response
        columns = [desc[0] for desc in cursor.description]
        new_car_details = dict(zip(columns, new_details_record))

        # Format dates for JSON response
        for key, value in new_car_details.items():
            if isinstance(value, (date, datetime)):
                new_car_details[key] = value.isoformat() if value else None # Handle potential None dates

        logger.info(f"Successfully created car details for car_id: {car_id}")
        return {"created": True, "data": new_car_details}

    except Exception as e:
        if conn:
            conn.rollback()
        logger.error(f"Error creating car for user {user_uuid}: {str(e)}")
        # Consider more specific error handling if needed (e.g., DataError for bad date format)
        raise # Re-raise the exception to be caught by the route handler
    finally:
        if conn:
            conn.close()