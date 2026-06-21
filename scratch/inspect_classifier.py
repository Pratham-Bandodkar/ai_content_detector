import h5py

with h5py.File("models/image/best_model.weights.h5", "r") as f:
    if 'layers' in f:
        layers = f['layers']
        for layer_name in layers.keys():
            layer_group = layers[layer_name]
            def print_datasets(name, obj):
                if isinstance(obj, h5py.Dataset) and ('classifier' in name or 'dense' in name or 'head' in name):
                    print(f"  Dataset: {name}, Shape: {obj.shape}")
            layer_group.visititems(print_datasets)
