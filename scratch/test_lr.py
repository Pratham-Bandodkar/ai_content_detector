import joblib

try:
    vectorizer = joblib.load("models/text/tfidf_vectorizer.pkl")
    classifier = joblib.load("models/text/logistic_regression_model.pkl")
        
    human_text = "I went to the store today and bought some apples. It was a nice sunny day, and I enjoyed the walk."
    ai_text = "Furthermore, it is important to consider that the intricate tapestry of human experience is multifaceted. In conclusion, we must remember that analysis is key."
    
    X_human = vectorizer.transform([human_text])
    X_ai = vectorizer.transform([ai_text])
    
    print("Human text prob [0, 1]:", classifier.predict_proba(X_human)[0])
    print("AI text prob [0, 1]:", classifier.predict_proba(X_ai)[0])
    
except Exception as e:
    import traceback
    traceback.print_exc()
