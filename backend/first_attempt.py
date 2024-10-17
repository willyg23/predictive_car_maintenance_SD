from flask import Flask, jsonify, request
from constants import CAR_ASSISTANT_MODEL_ID
import os
from dotenv import load_dotenv
load_dotenv()

from openai import OpenAI


client = OpenAI(
    api_key=os.environ.get("OPENAI_API_KEY"),
)



app = Flask(__name__)

def generate_gpt_response(prompt, model = CAR_ASSISTANT_MODEL_ID):

    GPT_MODEL = "gpt-4-1106-preview" #"gpt-3.5-turbo-1106"
    messages = [
            {"role": "system", "content": 'You answer question about Web  services.'
            },
            {"role": "user", "content": prompt},
        ]
    response = client.chat.completions.create(
            model="gpt-4",
            messages=messages,
            temperature=0
        )
    response_message = response.choices[0].message.content
    print(response_message)
    return response_message

@app.route('/generate-gpt-response', methods=['POST'])
def return_generated_response():
    # here i assume that the frontend will make a POST request to this route 
    data = request.json
    
    response_text = generate_gpt_response(data.get('prompt'), CAR_ASSISTANT_MODEL_ID)
    
    return jsonify({"response": response_text})

if __name__ == '__main__':
    app.run(debug=True)