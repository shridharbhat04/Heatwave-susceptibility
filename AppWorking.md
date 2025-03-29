# **Working of the Heatwave Susceptibility Web App**  

This web app is designed to visualize heatwave susceptibility and provide insights into climate-related impacts using interactive maps, data visualizations, and a chatbot. It is built using **Flask (backend), HTML, CSS, JavaScript (frontend), Leaflet.js (map rendering), and a trained machine learning model for heatwave prediction**.  

---

## **1. Web App Structure**
The application consists of multiple sections:  

### **A. Navigation Sidebar**
- Users can navigate through different sections, including:
  - About
  - Global Temperature
  - India’s Heatwave Score
  - Heatwave Score Prediction
  - Visualizations
  - Chatbot  

---

## **2. Functionalities of the Web App**
The app performs multiple operations, including **data visualization, heatwave prediction, and chatbot interaction**.

### **A. Homepage & Information (index.html)**
- Displays general information about **heatwaves, their impacts, factors contributing to their increase, and mitigation strategies**.
- Describes the **Heatwave Susceptibility Score (HSS)** and its importance.

---

### **B. Global Temperature Visualization**
#### **Working:**
1. **Dataset Used**: `final_temp_2050.csv` (Contains temperature data for different years, locations, and cities).
2. **User selects a year from the dropdown menu**.
3. A request is sent to `get_data/<year>` via Flask API to retrieve the temperature data.
4. Data is returned in JSON format and plotted using **Leaflet.js** on an interactive map.

#### **Backend API:**
```python
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
```

---

### **C. Heatwave Susceptibility Score of India**
#### **Working:**
1. **Dataset Used**: `heatwave_score.csv` (Contains heatwave risk data for Indian states).
2. The `get_india_data` API fetches **state-wise heatwave scores**.
3. The front-end uses this data to display an **interactive heatmap** on India’s map.

#### **Backend API:**
```python
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
```

---

### **D. Heatwave Susceptibility Score Prediction**
#### **Working:**
1. The user **enters numerical values** for:
   - Air Pollution Index
   - Carbon Emission Impact Score
   - Wellness and Healthcare Index
   - Groundwater Sustainability Score
   - Population Density Index
   - Rainfall Sufficiency Index
   - Temperature Variation Score
2. The app sends this input to the `/predict` API.
3. A **machine learning model** (loaded using `joblib`) predicts the **HSS score** based on the input values.
4. The predicted **Heatwave Susceptibility Score (HSS)** is displayed.

#### **Backend API:**
```python
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

        # Model Prediction (assuming model is loaded separately)
        prediction = model.predict(pd.DataFrame(input_data))
        return jsonify({"prediction": prediction[0]})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
```

---

### **E. Data Visualizations**
#### **Working:**
1. The app displays **pre-generated graphs** related to:
   - Temperature Variations
   - Carbon Emissions
   - Air Quality
   - Rainfall
   - Groundwater Levels
   - Healthcare Accessibility
   - Population Density
   - Heatwave Susceptibility Score
2. Hovering over images provides **detailed insights**.

---

### **F. Chatbot for Heatwave Information**
#### **Working:**
1. The user **inputs a prompt** in the chatbot text box.
2. The request is sent to `/submit` API.
3. The Flask server sends the user query to **Groq AI API** (OpenAI Chat Completion).
4. The chatbot processes the input and sends back a **response**.
5. The response is displayed in the chatbot text box.

#### **Backend API:**
```python
@app.route('/submit', methods=['POST'])
def submit_prompt():
    try:
        data = request.get_json()
        user_prompt = data.get('userPrompt', '')

        groq_response = send_to_groq(user_prompt, GROQ_API_URL)

        return jsonify({"response": groq_response})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
```

---

## **3. Technologies Used**
| Component | Technology Used |
|-----------|----------------|
| **Frontend** | HTML, CSS, JavaScript, Leaflet.js |
| **Backend** | Flask (Python), Pandas, NumPy |
| **Data Processing** | Pandas, CSV |
| **Machine Learning Model** | Joblib (Pre-trained Model) |
| **Chatbot API** | Groq API (Chat Completion) |
| **Map Visualization** | Leaflet.js |
| **Data Storage** | CSV Files |

---

## **4. Summary of the Web App Workflow**
1. **Home Page**: Provides heatwave information.
2. **Global Temperature**: Displays world temperature maps using Leaflet.
3. **India Heatwave Score**: Shows state-wise heatwave scores.
4. **Heatwave Prediction**: Predicts HSS using user inputs & machine learning.
5. **Visualizations**: Displays climate-related graphs.
6. **Chatbot**: AI-based chatbot answers climate-related queries.
