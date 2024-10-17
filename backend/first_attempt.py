from flask import Flask, jsonify
import openai, os


app = Flask(__name__)


# example
@app.route("/")
def hello_world():
    return "<p>Hello, World!</p>"


# open ai example
openai.api_key = os.getenv('openai_api_key')


def generate_haiku():
    response = openai.ChatCompletion.create(
        model="gpt-4", 
        messages=[
            {"role": "user", "content": "write a haiku about AI"}
        ]
    )
    return response['choices'][0]['message']['content']


@app.route('/generate-haiku', methods=['GET'])
def haiku():
    haiku_text = generate_haiku()
    return jsonify({"haiku": haiku_text})

if __name__ == '__main__':
    app.run(debug=True)
