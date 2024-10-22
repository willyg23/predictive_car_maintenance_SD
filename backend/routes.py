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
    data = request.json
    response_text = generate_gpt_response(data.get('prompt'), data.get('model'))
    return jsonify({"response": response_text})

@app.route("/")
def hello_world():
    return "<p>default route</p>"


if __name__ == '__main__':
    app.run(debug=True)



    