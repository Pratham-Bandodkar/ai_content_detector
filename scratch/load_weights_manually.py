import keras
import h5py
import numpy as np

try:
    print("Building custom Keras video model...")
    input_shape = (None, 224, 224, 3)
    inputs = keras.layers.Input(shape=input_shape, name="input_1")
    
    # We construct the EfficientNetB0 backbone without top
    backbone = keras.applications.EfficientNetB0(include_top=False, weights=None, input_shape=(224, 224, 3))
    
    x = keras.layers.TimeDistributed(backbone, name="time_distributed")(inputs)
    x = keras.layers.TimeDistributed(keras.layers.GlobalAveragePooling2D(), name="time_distributed_1")(x)
    
    lstm_out = keras.layers.LSTM(32, name="lstm")(x)
    gap_out = keras.layers.GlobalAveragePooling1D(name="global_average_pooling1d")(x)
    concat = keras.layers.concatenate([gap_out, lstm_out], name="concatenate")
    
    d = keras.layers.Dense(32, activation="relu", name="dense")(concat)
    drop = keras.layers.Dropout(0.5, name="dropout")(d)
    outputs = keras.layers.Dense(1, activation="sigmoid", name="dense_1")(drop)
    
    model = keras.models.Model(inputs=inputs, outputs=outputs)
    print("Model built successfully!")
    
    # Load H5 weights using h5py and map them to variables
    h5_path = "models/video/ai_video_detector.h5"
    print(f"Loading weights from {h5_path} manually...")
    
    # Build the model variables (so that all weights exist)
    dummy_input = np.zeros((1, 5, 224, 224, 3))
    _ = model(dummy_input)
    
    # Create a mapping from model weights to H5 weights
    # Let's inspect model weight names
    model_weights = {w.path: w for w in model.weights}
    print(f"Model has {len(model_weights)} weights.")
    
    with h5py.File(h5_path, 'r') as f:
        # Collect all weights in H5 file
        h5_weights = {}
        def collect_weights(name, obj):
            if isinstance(obj, h5py.Dataset):
                # The name in H5 has a suffix like :0, let's keep it or normalize
                # e.g., 'time_distributed/stem_conv/kernel:0' or 'lstm/lstm_cell/kernel:0'
                clean_name = name.replace(':0', '')
                h5_weights[clean_name] = obj[()]
        f.visititems(collect_weights)
        
    print(f"Collected {len(h5_weights)} weights from H5 file.")
    
    # Match weights
    matched = 0
    not_matched = []
    for path, w in model_weights.items():
        # Keras 3 paths look like 'functional/time_distributed/stem_conv/kernel'
        # Or 'time_distributed/stem_conv/kernel'
        # Let's see if we can find a match by ending suffix
        matched_h5_key = None
        for h5_key in h5_weights.keys():
            # If the path ends with the h5_key or vice versa
            if path.endswith(h5_key) or h5_key.endswith(path):
                matched_h5_key = h5_key
                break
        
        # If not matched directly, let's try matching parts
        if not matched_h5_key:
            # check if path contains layer name and weight type
            # e.g. path 'functional/time_distributed/efficientnetb0/stem_conv/kernel'
            # h5_key 'time_distributed/stem_conv/kernel'
            for h5_key in h5_weights.keys():
                h5_parts = h5_key.split('/')
                # if the last two parts match
                if len(h5_parts) >= 2 and '/'.join(h5_parts[-2:]) in path:
                    matched_h5_key = h5_key
                    break
                    
        if matched_h5_key:
            val = h5_weights[matched_h5_key]
            if w.shape != val.shape:
                print(f"Shape mismatch for {path}: model={w.shape}, H5={val.shape} (h5_key={matched_h5_key})")
                not_matched.append(path)
            else:
                w.assign(val)
                matched += 1
        else:
            print(f"Not matched in H5: {path}")
            not_matched.append(path)
            
    print(f"Successfully matched and assigned {matched}/{len(model_weights)} weights.")
    if not_matched:
        print(f"Mismatched layers: {len(not_matched)}")
        for path in not_matched[:5]:
            print(f"  {path}")
            
except Exception as e:
    import traceback
    traceback.print_exc()
