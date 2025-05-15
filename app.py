from flask import Flask, render_template, request, jsonify
import os
import subprocess
import uuid

app = Flask(__name__)
UPLOAD_FOLDER = 'uploads'
COMPILER_PATH = './compiler/pkm'

@app.route('/')
def home():
    return render_template('index.html', code='', output='')

@app.route('/compile', methods=['POST'])
def compile_code():
    data = request.get_json()
    code = data.get('code')

    if not code:
        return jsonify({'error': 'No code provided'}), 400

    filename = os.path.join(UPLOAD_FOLDER, f"{uuid.uuid4().hex}.pkm")

    try:
        with open(filename, 'w') as f:
            f.write(code)

        result = subprocess.run(
            [COMPILER_PATH, filename],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            timeout=5,
            text=True
        )

        output = result.stdout.strip()
        error = result.stderr.strip()

        combined_output = ""
        if output:
            combined_output += "Output:\n" + output
        if error:
            combined_output += "\n\nType Errors:\n" + error

        return jsonify({'output': combined_output.strip()})

    except Exception as e:
        return jsonify({'error': f"⚠️ Error: {str(e)}"}), 500

@app.route('/upload', methods=['POST'])
def upload_file():
    file = request.files.get('file')
    if file and file.filename.endswith('.pkm'):
        code = file.read().decode('utf-8')
        return render_template('index.html', code=code, output='')
    return render_template('index.html', code='', output='⚠️ Invalid file type.')

if __name__ == '__main__':
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    app.run(debug=True)
