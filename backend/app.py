from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import string
import re
from textblob import TextBlob
import numpy as np

app = Flask(__name__)
CORS(app)

# Load trained components
model = joblib.load('model/model.pkl')
vectorizer = joblib.load('model/vectorizer.pkl')
scaler = joblib.load('model/scaler.pkl')

# Preprocessing function
def preprocess_review(text):
    text = text.lower()
    text = re.sub(r"http\S+", "", text)
    text = text.translate(str.maketrans("", "", string.punctuation))
    text = re.sub(r"\d+", "", text)

    length = len(text)
    sentiment = TextBlob(text).sentiment.polarity
    scaled_features = scaler.transform([[length, sentiment]])
    tfidf_vector = vectorizer.transform([text])
    combined_features = np.hstack((tfidf_vector.toarray(), scaled_features))
    return combined_features

# Home route
@app.route('/')
def home():
    return "✅ Fake Review Detection API is running."

# Prediction route
@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        if not data or 'review' not in data:
            return jsonify({"error": "No review provided"}), 400

        review = data['review']
        processed = preprocess_review(review)
        prediction = model.predict(processed)[0]

        # Optional: Map back to original label format if needed
        reverse_map = {'fake': 'OR', 'genuine': 'CG'}
        original_label = reverse_map.get(prediction, prediction)

        confidence = None
        if hasattr(model, 'predict_proba'):
            proba = model.predict_proba(processed)
            label_index = list(model.classes_).index(prediction)
            confidence = round(proba[0][label_index], 2)

        return jsonify({
            "prediction": original_label,
            "confidence": confidence
        })

    except Exception as e:
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True)
