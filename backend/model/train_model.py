import pandas as pd
import numpy as np
import string
import joblib
import re
from textblob import TextBlob
from sklearn.preprocessing import MinMaxScaler
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.neighbors import KNeighborsClassifier
from sklearn.ensemble import VotingClassifier
from sklearn.metrics import accuracy_score

# 1. Load the Dataset
df = pd.read_csv("model/fake reviews dataset.csv")
df = df[['text_', 'label']]
df = df.rename(columns={'text_': 'text'})

# 2. Map label: CG = genuine, OR = fake
df['label'] = df['label'].map({'CG': 'genuine', 'OR': 'fake'})

# 3. Clean text
def clean_text(text):
    text = text.lower()
    text = re.sub(r"http\S+", "", text)
    text = text.translate(str.maketrans("", "", string.punctuation))
    text = re.sub(r"\d+", "", text)
    return text

df['clean_text'] = df['text'].apply(clean_text)

# 4. Additional features
df['length'] = df['clean_text'].apply(len)
df['sentiment'] = df['clean_text'].apply(lambda x: TextBlob(x).sentiment.polarity)

# 5. Scale length and sentiment
scaler = MinMaxScaler()
df[['length', 'sentiment']] = scaler.fit_transform(df[['length', 'sentiment']])

# 6. TF-IDF vectorizer
vectorizer = TfidfVectorizer(max_features=5000)
X_text = vectorizer.fit_transform(df['clean_text'])

# Combine TF-IDF and scaled features
X = np.hstack((X_text.toarray(), df[['length', 'sentiment']].values))
y = df['label']

# 7. Train-test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 8. Models
nb = MultinomialNB()
knn = KNeighborsClassifier(n_neighbors=5)

model = VotingClassifier(estimators=[('nb', nb), ('knn', knn)], voting='hard')
model.fit(X_train, y_train)

# 9. Evaluate
y_pred = model.predict(X_test)
print("✅ Model Accuracy:", accuracy_score(y_test, y_pred))

# 10. Save everything
joblib.dump(model, 'model/model.pkl')
joblib.dump(vectorizer, 'model/vectorizer.pkl')
joblib.dump(scaler, 'model/scaler.pkl')
print("✅ Model, Vectorizer, and Scaler saved.")
