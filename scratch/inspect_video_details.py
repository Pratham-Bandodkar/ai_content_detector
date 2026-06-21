import h5py

with h5py.File("models/video/ai_video_detector.h5", "r") as f:
    for group_name in f.keys():
        g = f[group_name]
        print(f"\nGroup: {group_name}")
        if isinstance(g, h5py.Group):
            # Print only datasets immediately in this group or its subgroups, excluding time_distributed (which is huge)
            if group_name == 'time_distributed':
                print("  (EfficientNetB0 weights, skipped detailed print)")
                continue
            
            def print_ds(name, obj):
                if isinstance(obj, h5py.Dataset):
                    print(f"  Dataset: {name}, Shape: {obj.shape}")
            g.visititems(print_ds)
