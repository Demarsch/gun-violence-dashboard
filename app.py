import pandas as pd

from flask import Flask, jsonify, render_template

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/categories')
def categories():
    return jsonify([
        'Suicide',
        'Officer Involved',
        'Self Defense',
        'Armed Robbery',
        'Drugs Involved',
        'Gangs Involved',
        'Terrorism',
        'Accidental',
    ])

if __name__ == '__main__':
    app.run(debug=True)
