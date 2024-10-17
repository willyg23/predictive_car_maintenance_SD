from flask import Flask, jsonify, request
from constants import CAR_ASSISTANT_MODEL_ID
import openai, os
from dotenv import load_dotenv
load_dotenv()
openai.api_key = os.getenv('openai_api_key')


app = Flask(__name__)

def generate_gpt_response(prompt, model):
    response = openai.ChatCompletion.create(
        model=model,  # here we specify the model. could be generic like "gpt-4o", or the ID of a fine-tuned model, like the car assitant
        messages=[
            {"role": "user", "content": prompt}  # using the user's prompt
        ]
    )
    return response['choices'][0]['message']['content']

@app.route('/generate-gpt-response', methods=['POST'])
def return_generated_response():
    # here i assume that the frontend will make a POST request to this route 
    data = request.json
    
    response_text = generate_gpt_response(data.get('prompt'), CAR_ASSISTANT_MODEL_ID)
    
    return jsonify({"response": response_text})

if __name__ == '__main__':
    app.run(debug=True)