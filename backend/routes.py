###
from flask import Flask, jsonify, request
import os
from dotenv import load_dotenv
load_dotenv()
from openai import OpenAI

client = OpenAI(
    api_key=os.environ.get("OPENAI_API_KEY"),
)

app = Flask(__name__)

def generate_gpt_response(prompt, model):
    messages = [
            {"role": "system", "content": 'You answer question about cars. Most commonly, car maintenance'
            },
            {"role": "user", "content": prompt},
        ]
    response = client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=0
        )
    response_message = response.choices[0].message.content
    print(response_message)
    return response_message

@app.route('/generate-gpt-response', methods=['POST'])
def return_generated_response():
    try:
        data = request.json
        if not data or 'prompt' not in data or 'model' not in data:
            return jsonify({"error": "Missing prompt or model"}), 400
            
        response_text = generate_gpt_response(data.get('prompt'), data.get('model'))
        return jsonify({"response": response_text})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/")
def hello_world():
    return "<p>default route</p>"

@app.route("/health")
def health_check():
    return jsonify({"status": "healthy"}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 80)))
    #change port to 5000 for local development

    # host is letting the server accept traffic from anywhere. change later to only accept traffic from ALB
    # port is the port where the server both recieves and sends traffic on
        # right now i only let the ALB send out HTTP traffic (port 80). might chnage that to allow HTTPS as well. 
        # I forget if there's a reason I wanted only port 80, or if i just forgot to add an ALB egress rule for HTTPS. probably the latter.

    