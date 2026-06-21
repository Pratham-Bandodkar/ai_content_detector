import keras
import json
import numpy as np

try:
    print("Loading audio model structure from config.json...")
    with open("models/audio/config.json", "r") as f:
        model_config = json.load(f)
        
    # Keras 3 deserialization
    model = keras.utils.deserialize_keras_object(model_config)
    print("Model structure built successfully!")
    model.summary()
    
    # Load weights
    h5_path = "models/audio/model.weights.h5"
    print(f"Loading weights from {h5_path}...")
    model.load_weights(h5_path)
    print("Audio model weights loaded successfully!")
    
except Exception as e:
    import traceback
    traceback.print_exc()
