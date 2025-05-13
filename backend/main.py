from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import os
import matplotlib
import pandas as pd
import requests
matplotlib.use('Agg')  # Use non-interactive backend

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Load the model
model_path = os.path.join(os.path.dirname(__file__), "model/fraud_detection.pkl")
try:
    model = joblib.load(model_path)
    print(f"Model loaded successfully from {model_path}")
except Exception as e:
    print(f"Error loading model: {e}")
    model = None

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok", "model_loaded": model is not None})

def preprocess_form_data(form_data):
    """
    Process the form data to extract and calculate required model features
    """
    payee_info = form_data.get('payeeInformation', {})
    transaction_info = form_data.get('transactionInformation', {})
    
    print(f'payee info: {payee_info}')
    print(f'transaction info: {transaction_info}')

    average_spending = payee_info.get('averageSpending', 0)
    if average_spending == 0:
        ratio = 1.0
    else:
        ratio = transaction_info.get('orderAmount', 0) / average_spending
    
    payment_mode = transaction_info.get('paymentMode', '').lower()
    used_pin = payment_mode == 'pin'
    used_chip = payment_mode == 'chip'
    online_order = payment_mode == 'online'
    
    print(f'dfh: {form_data.get('distance_from_home')}')
    print(f'dflt: {form_data.get('distance_from_last_transaction')}')

    distance_from_home = form_data.get('distance_from_home', 0)
    distance_from_last_transaction = form_data.get('distance_from_last_transaction',0)
    
    is_first_time = transaction_info.get('isFirstTime', True)
    
    return {
        'ratio_to_median_purchase_price': ratio,
        'online_order': online_order,
        'distance_from_home': distance_from_home,
        'used_pin': used_pin,
        'used_chip': used_chip,
        'distance_from_last_transaction': distance_from_last_transaction,
        'repeat_retailer': not is_first_time
    }

@app.route('/api/classify', methods=['POST'])
def classify():
    if model is None:
        return jsonify({"error": "Model not loaded"}), 500
    
    form_data = request.json
    if not form_data:
        return jsonify({"error": "No form data provided"}), 400
    
    try:
        processed_data = preprocess_form_data(form_data)

        data_dict = {
            'distance_from_home': processed_data['distance_from_home'],
            'distance_from_last_transaction': processed_data['distance_from_last_transaction'],
            'ratio_to_median_purchase_price': processed_data['ratio_to_median_purchase_price'],
            'repeat_retailer': processed_data['repeat_retailer'],
            'used_chip': processed_data['used_chip'],
            'used_pin_number': processed_data['used_pin'],
            'online_order': processed_data['online_order'],
        }

        # Convert to DataFrame
        features_df = pd.DataFrame([data_dict])
        # Ensure the DataFrame has the same columns as the model was trained on
    

        # Make prediction
        prediction = model.predict(features_df)[0]
        prediction_proba = model.predict_proba(features_df)[0]
        print(f'Prediction: {prediction}, Probabilities: {prediction_proba}')
        
        # Get confidence score
        confidence = float(prediction_proba[1]) if prediction == 1 else float(prediction_proba[0])
        
        # Return result
        result = {
            "fraudulent": bool(prediction),
            "confidence": round(confidence * 100, 2),
            "processed_features": processed_data,
        }
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/distance', methods=['POST'])
def get_distance():
    try:
        data = request.json
        origin = data.get('origin')
        destination = data.get('destination')
        
        if not origin or not destination:
            return jsonify({"error": "Both origin and destination are required"}), 400
        
        # Get API key from environment variable or use a config file
        api_key = "CpvtwQQyRnCmEZ8nXZVLrceqZb7eZByLthUuADDF1a3FfKF11uFNbUvHJSUCwhqw"
        url = f"https://api-v2.distancematrix.ai/maps/api/distancematrix/json?origins={origin}&destinations={destination}&key={api_key}"
        
        response = requests.get(url)
        if response.status_code != 200:
            return jsonify({"error": f"API request failed with status {response.status_code}"}), response.status_code
        
        result = response.json()
        
        # Extract the relevant distance information
        if result.get('status') == 'OK':
            rows = result.get('rows', [])
            if rows and len(rows) > 0:
                elements = rows[0].get('elements', [])
                if elements and len(elements) > 0 and elements[0].get('status') == 'OK':
                    distance_value = elements[0].get('distance', {}).get('value', 0)
                    # Convert meters to kilometers
                    distance_km = distance_value / 1000.0
                    return jsonify({"distance": distance_km})
        
        return jsonify({"error": "Could not calculate distance"}), 400
        
    except Exception as e:
        print(f"Error in distance API: {str(e)}")
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5000)