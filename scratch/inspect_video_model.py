"""
Inspect video model H5 file and test label orientation.
Run from the project root or scratch directory.
"""
import sys
import os
import h5py
import numpy as np

MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "models", "video", "ai_video_detector.h5")
MODEL_PATH = os.path.abspath(MODEL_PATH)

print(f"Model path: {MODEL_PATH}")
print(f"Model exists: {os.path.exists(MODEL_PATH)}")

print("\n--- H5 File Top-Level Keys ---")
with h5py.File(MODEL_PATH, "r") as f:
    def print_tree(name, obj):
        indent = "  " * name.count("/")
        if isinstance(obj, h5py.Dataset):
            print(f"{indent}[DATASET] {name} | shape={obj.shape} | dtype={obj.dtype}")
        elif isinstance(obj, h5py.Group):
            print(f"{indent}[GROUP] {name}")
    
    for key in f.keys():
        print(f"Top: {key}")
    
    print("\n--- Full Structure (first 60 items) ---")
    count = [0]
    def visit_limited(name, obj):
        if count[0] >= 60:
            return None
        indent = "  " * name.count("/")
        if isinstance(obj, h5py.Dataset):
            print(f"{indent}[D] {name}  shape={obj.shape}")
        else:
            print(f"{indent}[G] {name}")
        count[0] += 1
    f.visititems(visit_limited)

# Check if there are any attributes with label info
print("\n--- Checking H5 Attributes ---")
with h5py.File(MODEL_PATH, "r") as f:
    def check_attrs(name, obj):
        if obj.attrs:
            for k, v in obj.attrs.items():
                print(f"  {name}.{k} = {v}")
    f.visititems(check_attrs)

print("\nDone.")
