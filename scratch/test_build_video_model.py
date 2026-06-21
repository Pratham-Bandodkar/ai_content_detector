import keras
import numpy as np

try:
    print("Building custom Keras video model...")
    # Define inputs
    input_shape = (None, 224, 224, 3) # (frames, 224, 224, 3)
    inputs = keras.layers.Input(shape=input_shape, name="input_1")
    
    # TimeDistributed EfficientNetB0
    # Let's construct the EfficientNetB0 backbone without top
    backbone = keras.applications.EfficientNetB0(include_top=False, weights=None, input_shape=(224, 224, 3))
    
    # TimeDistributed wrappers
    x = keras.layers.TimeDistributed(backbone, name="time_distributed")(inputs)
    x = keras.layers.TimeDistributed(keras.layers.GlobalAveragePooling2D(), name="time_distributed_1")(x)
    
    # LSTM branch
    lstm_out = keras.layers.LSTM(32, name="lstm")(x)
    
    # Global average pooling over time branch
    gap_out = keras.layers.GlobalAveragePooling1D(name="global_average_pooling1d")(x)
    
    # Concatenate
    concat = keras.layers.concatenate([gap_out, lstm_out], name="concatenate")
    
    # Dense classifier
    d = keras.layers.Dense(32, activation="relu", name="dense")(concat)
    drop = keras.layers.Dropout(0.5, name="dropout")(d)
    outputs = keras.layers.Dense(1, activation="sigmoid", name="dense_1")(drop)
    
    model = keras.models.Model(inputs=inputs, outputs=outputs)
    print("Model architecture built successfully!")
    model.summary()
    
    # Load weights
    h5_path = "models/video/ai_video_detector.h5"
    print(f"Loading weights from {h5_path}...")
    model.load_weights(h5_path)
    print("Weights loaded successfully!")
    
except Exception as e:
    import traceback
    traceback.print_exc()
