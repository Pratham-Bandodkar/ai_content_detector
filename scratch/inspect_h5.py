import h5py

def inspect_h5_file(filepath):
    print(f"\n--- Inspecting {filepath} ---")
    try:
        with h5py.File(filepath, 'r') as f:
            print("Attributes:")
            for k, v in f.attrs.items():
                print(f"  {k}: {v}")
            
            print("\nKeys (top-level):")
            keys = list(f.keys())
            print(f"  Total keys: {len(keys)}")
            for k in keys[:15]:
                print(f"  - {k}")
                # Print some group details
                g = f[k]
                if isinstance(g, h5py.Group):
                    print(f"    Subkeys: {list(g.keys())[:5]}")
                    for sk in list(g.keys())[:3]:
                        sg = g[sk]
                        if isinstance(sg, h5py.Dataset):
                            print(f"      Dataset: {sk}, Shape: {sg.shape}, Dtype: {sg.dtype}")
                        elif isinstance(sg, h5py.Group):
                            print(f"      Group: {sk}, Subkeys: {list(sg.keys())[:3]}")
                elif isinstance(g, h5py.Dataset):
                    print(f"    Dataset shape: {g.shape}, Dtype: {g.dtype}")
    except Exception as e:
        print(f"Error inspecting {filepath}: {e}")

inspect_h5_file("models/image/best_model.weights.h5")
inspect_h5_file("models/video/ai_video_detector.h5")
inspect_h5_file("models/audio/model.weights.h5")
