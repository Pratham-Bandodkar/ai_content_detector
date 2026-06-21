import pickle
import json

try:
    print("Loading cnn_norm.pkl...")
    with open("models/audio/cnn_norm.pkl", "rb") as f:
        norm_data = pickle.load(f)
        print("cnn_norm class:", type(norm_data))
        if isinstance(norm_data, dict):
            for k, v in norm_data.items():
                print(f"  {k}: type={type(v)}, shape={getattr(v, 'shape', 'N/A')}")
        else:
            print("  value:", norm_data)
            
    print("\nLoading metadata.json...")
    with open("models/audio/metadata.json", "r") as f:
        meta = json.load(f)
        print("metadata:", meta)
        
except Exception as e:
    import traceback
    traceback.print_exc()
