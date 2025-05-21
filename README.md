# 🚀 Fake Product Review Detection System

## 📌 Overview
This project aims to classify online product reviews as **genuine or fake** using **Natural Language Processing (NLP)** and **Machine Learning (ML)** techniques. It utilizes text mining methods along with **Naïve Bayes** and **k-Nearest Neighbors (k-NN)** classifiers.

## ✨ Features
- ✅ **Preprocessing of text reviews** (removal of stopwords, punctuation, and tokenization)
- ✅ **Feature extraction** using TF-IDF
- ✅ **Classification models**: Naïve Bayes & k-NN
- ✅ **Performance evaluation** with accuracy and classification report
- ✅ **Deployment-ready**: Model saving & prediction

## 🛠 Technologies Used
- 🐍 Python
- 🤖 Scikit-learn
- 📚 NLTK
- 📊 Pandas
- 🔢 NumPy

## 📂 Dataset
The dataset consists of product reviews labeled as **genuine (0) or fake (1)**. You can use public datasets like:
- 📦 [Amazon Reviews](https://www.kaggle.com/datasets)
- 🏢 [Yelp Reviews](https://www.yelp.com/dataset)

## ⚙️ Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/Fake-Review-Detection.git
   cd Fake-Review-Detection
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## 🚀 Usage
1. **Train the Model**
   ```bash
   python train.py
   ```
2. **Test on Sample Review**
   ```bash
   python predict.py "This product is amazing! Best purchase ever."
   ```

## 📁 Project Structure
```
Fake-Review-Detection/
│── 📂 data/                # Dataset folder
│── 📂 models/              # Saved models
│── 📜 train.py             # Training script
│── 🔍 predict.py           # Prediction script
│── 📃 requirements.txt     # Required dependencies
│── 📄 README.md            # Project documentation
```

 
