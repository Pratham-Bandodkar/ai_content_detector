import h5py

with h5py.File("models/image/best_model.weights.h5", "r") as f:
    def print_attrs(name, obj):
        print(name)
        for key, val in obj.attrs.items():
            print("    ", key, ":", val)
            
    f.visititems(print_attrs)
