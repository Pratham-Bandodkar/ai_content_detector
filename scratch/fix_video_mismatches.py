import keras
import h5py
import numpy as np

try:
    input_shape = (None, 224, 224, 3)
    inputs = keras.layers.Input(shape=input_shape, name="input_1")
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
    dummy_input = np.zeros((1, 5, 224, 224, 3))
    _ = model(dummy_input)
    
    # Inspect model weights that were not matched
    model_weights = {w.path: w for w in model.weights}
    
    h5_path = "models/video/ai_video_detector.h5"
    with h5py.File(h5_path, 'r') as f:
        h5_weights = {}
        def collect_weights(name, obj):
            if isinstance(obj, h5py.Dataset):
                clean_name = name.replace(':0', '')
                h5_weights[clean_name] = obj[()]
        f.visititems(collect_weights)
        
    print("\nModel Weight Paths (some examples):")
    example_paths = list(model_weights.keys())[:15]
    for p in example_paths:
        print(f"  {p}")
        
    print("\nH5 Weight Keys (some examples):")
    example_h5 = list(h5_weights.keys())[:15]
    for k in example_h5:
        print(f"  {k}")
        
    # Let's see if we can do a smart match
    matched = 0
    not_matched = []
    for path, w in model_weights.items():
        matched_h5_key = None
        for h5_key in h5_weights.keys():
            # Replace depthwise_kernel with kernel for comparison
            norm_h5_key = h5_key.replace("depthwise_kernel", "kernel")
            if path.endswith(norm_h5_key) or norm_h5_key.endswith(path):
                matched_h5_key = h5_key
                break
                
        if not matched_h5_key:
            # Try matching based on layer name part and weight name
            for h5_key in h5_weights.keys():
                norm_h5_key = h5_key.replace("depthwise_kernel", "kernel")
                h5_parts = norm_h5_key.split('/')
                # If the last two parts of the normalized h5 key are in the path
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
            not_matched.append(path)
            
    print(f"\nSmart Matched: {matched}/{len(model_weights)}")
    if not_matched:
        print(f"Still not matched: {len(not_matched)}")
        for path in not_matched[:5]:
            print(f"  {path}")
            
except Exception as e:
    import traceback
    traceback.print_exc()
