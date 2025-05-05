from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import os
import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend
import matplotlib.pyplot as plt
import io
import base64
from sklearn.tree import export_graphviz, plot_tree
import pydot
from IPython.display import Image

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

@app.route('/api/predict', methods=['POST'])
def predict():
    if model is None:
        return jsonify({"error": "Model not loaded"}), 500
    
    # Get data from request
    data = request.json
    
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    try:
        # Extract features from the request data
        # Create a list with the features in the correct order for the model
        features = [
            data.get('ratio_to_median_purchase_price', 0.0),  # Calculate this from orderAmount and averageSpending
            1 if data.get('paymentMode') == 'online' else 0,  # online_order
            data.get('distance', 0.0),                        # distance_from_home
            1 if data.get('paymentMode') == 'pin' else 0,     # used_pin
            1 if data.get('paymentMode') == 'chip' else 0,    # used_chip
            data.get('distance_from_last_transaction', 0.0),  # Default to 0 if not provided
            1 if not data.get('isFirstTime') else 0           # repeat_retailer (opposite of isFirstTime)
        ]
        
        # Reshape for sklearn
        features_array = np.array(features).reshape(1, -1)
        
        # Make prediction
        prediction = model.predict(features_array)[0]
        prediction_proba = model.predict_proba(features_array)[0]
        
        # Get confidence score (probability of the predicted class)
        confidence = float(prediction_proba[1]) if prediction == 1 else float(prediction_proba[0])
        
        # Return prediction and confidence
        result = {
            "fraudulent": bool(prediction),
            "confidence": round(confidence * 100, 2),  # Convert to percentage and round to 2 decimal places
            "features_used": {
                "ratio_to_median_purchase_price": features[0],
                "online_order": bool(features[1]),
                "distance_from_home": features[2],
                "used_pin": bool(features[3]),
                "used_chip": bool(features[4]),
                "distance_from_last_transaction": features[5],
                "repeat_retailer": bool(features[6])
            }
        }
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok", "model_loaded": model is not None})

def preprocess_form_data(form_data):
    """
    Process the form data to extract and calculate required model features
    """
    payee_info = form_data.get('payeeInformation', {})
    transaction_info = form_data.get('transactionInformation', {})
    
    # Calculate ratio to median purchase price
    average_spending = payee_info.get('averageSpending', 0)
    if average_spending == 0:
        ratio = 1.0  # Default to 1.0 to avoid division by zero
    else:
        ratio = transaction_info.get('orderAmount', 0) / average_spending
    
    # Map payment mode to pin/chip usage
    payment_mode = transaction_info.get('paymentMode', '').lower()
    used_pin = payment_mode == 'pin'
    used_chip = payment_mode == 'chip'
    online_order = payment_mode == 'online'
    
    # Distance features
    distance_from_home = form_data.get('distance', 0)
    
    # First time or repeat customer
    is_first_time = transaction_info.get('isFirstTime', True)
    
    return {
        'ratio_to_median_purchase_price': ratio,
        'online_order': online_order,
        'distance_from_home': distance_from_home,
        'used_pin': used_pin,
        'used_chip': used_chip,
        'distance_from_last_transaction': 0,  # Default since we don't have this data
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
        # Process form data into model features
        processed_data = preprocess_form_data(form_data)
        
        # Prepare features array for prediction
        features = [
            processed_data['ratio_to_median_purchase_price'],
            1 if processed_data['online_order'] else 0,
            processed_data['distance_from_home'],
            1 if processed_data['used_pin'] else 0,
            1 if processed_data['used_chip'] else 0,
            processed_data['distance_from_last_transaction'],
            1 if processed_data['repeat_retailer'] else 0
        ]
        
        feature_names = [
            'Ratio to median purchase',
            'Online order',
            'Distance from home',
            'Used PIN',
            'Used chip',
            'Distance from last transaction',
            'Repeat retailer'
        ]
        
        features_array = np.array(features).reshape(1, -1)
        
        # Make prediction
        prediction = model.predict(features_array)[0]
        prediction_proba = model.predict_proba(features_array)[0]
        
        # Get confidence score
        confidence = float(prediction_proba[1]) if prediction == 1 else float(prediction_proba[0])
        
        # Get feature importances for this prediction
        if hasattr(model, 'feature_importances_'):
            importances = model.feature_importances_
            feature_importance = dict(zip(feature_names, importances.tolist()))
        else:
            feature_importance = {}
        
        # Generate a decision tree visualization
        tree_visualization = generate_tree_visualization(model, features_array, feature_names)
        
        # Return result
        result = {
            "fraudulent": bool(prediction),
            "confidence": round(confidence * 100, 2),
            "feature_importance": feature_importance,
            "processed_features": processed_data,
            "tree_visualization": tree_visualization
        }
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def generate_tree_visualization(model, features_array, feature_names):
    """Generate a visualization of a sample tree from the random forest"""
    try:
        # Get a sample tree from the forest (first tree)
        estimator = model.estimators_[0]
        
        # Create a figure to hold the plot
        plt.figure(figsize=(12, 8))
        
        # Plot the decision tree
        plot_tree(
            estimator, 
            feature_names=feature_names,
            class_names=['Not Fraud', 'Fraud'],
            filled=True, 
            rounded=True,
            max_depth=3  # Limit depth for readability
        )
        
        # Save the plot to a BytesIO object
        buffer = io.BytesIO()
        plt.savefig(buffer, format='png', bbox_inches='tight', dpi=100)
        plt.close()
        
        # Convert the image to a base64 string
        buffer.seek(0)
        image_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
        
        # Return a data URL
        return f"data:image/png;base64,{image_base64}"
    
    except Exception as e:
        print(f"Error generating tree visualization: {e}")
        return None

if __name__ == '__main__':
    app.run(debug=True, port=5000)