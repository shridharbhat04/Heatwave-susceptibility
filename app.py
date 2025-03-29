from flask import Flask, render_template, jsonify,  request
import pandas as pd
import numpy as np
from send_to_groq import send_to_groq
import joblib

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

app = Flask(__name__)

temperature_data = pd.read_csv('Datasets/final_temp_2050.csv')

heatwave_data = pd.read_csv('Datasets/heatwave_score.csv')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/get_data/<year>')
def get_data(year):
    year_data = temperature_data[temperature_data['year'] == int(year)]
    locations = []
    for _, row in year_data.iterrows():
        locations.append({
            'lat': row['lat'],
            'lon': row['lon'],
            'temp': row['temp'],
            'city': row['city'],
            'country': row['country']
        })
    return jsonify(locations)

@app.route('/get_india_data')
def get_india_data():
    try:
        india_states = []
        for _, row in heatwave_data.iterrows():
            india_states.append({
                'state': row['State'],
                'lat': row['lat'],  
                'lon': row['lon'],
                'category': row['Category'],
                'air_pollution': row['Air Pollution Index'],
                'carbon_emissions': row['Carbon Emission Impact Score'],
                'healthcare': row['Wellness and Healthcare Index'],
                'groundwater': row['Groundwater Sustainability Score'],
                'population': row['Population Density Index'],
                'rainfall': row['Rainfall Sufficiency Index'],
                'temperature': row['Temperature Variation Score'],
                'heatwave': row['Heatwave Susceptiblity Score']
            })
        return jsonify(india_states)
    except Exception as e:
        print(f"Error in /get_india_data: {e}")
        return jsonify({"error": "Data processing failed"}), 500

@app.route('/submit', methods=['POST'])
def submit_prompt():
    try:
        data = request.get_json()
        user_prompt = data.get('userPrompt', '')

        groq_response = send_to_groq(user_prompt, GROQ_API_URL)

        return jsonify({"response": groq_response})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        API = data.get('API', '')
        CEIS = data.get('CEIS', '')
        WHI = data.get('WHI', '')
        GSS = data.get('GSS', '')
        PDI = data.get('PDI', '')
        RSI = data.get('RSI', '')
        TVS = data.get('TVS', '')

        input_data = {
            'Air Pollution Index': [API],
            'Carbon Emission Impact Score': [CEIS],
            'Wellness and Healthcare Index': [WHI],
            'Groundwater Sustainability Score': [GSS],
            'Population Density Index': [PDI],
            'Rainfall Sufficiency Index': [RSI],
            'Temperature Variation Score': [TVS]
        }

        input_df = pd.DataFrame(input_data)
        model = joblib.load('ML_model.pkl')

        predicted_hss = model.predict(input_df)
        predicted_hss = np.clip(predicted_hss, 0, 1)

        def classify_hss(score):
            if 0.00 <= score <= 0.30:
                return 'Low Susceptibility'
            elif 0.31 <= score <= 0.50:
                return 'Moderate Susceptibility'
            elif 0.51 <= score <= 0.70:
                return 'High Susceptibility'
            elif 0.71 <= score <= 1.00:
                return 'Very High Susceptibility'
            else:
                return 'Invalid Score'

        predicted_category = classify_hss(predicted_hss[0])        

        return jsonify({"Predicted HSS": predicted_hss[0],
                        "Predicted Category": predicted_category})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
