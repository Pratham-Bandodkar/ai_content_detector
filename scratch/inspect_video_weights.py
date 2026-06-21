import h5py

with h5py.File("models/video/ai_video_detector.h5", "r") as f:
    print("Top level keys:", list(f.keys()))
    def print_datasets(name, obj):
        if isinstance(obj, h5py.Dataset):
            print(f"Dataset: {name}, Shape: {obj.shape}")
    f.visititems(print_datasets)
