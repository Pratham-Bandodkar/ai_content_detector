import os
import sys

print("Python executable:", sys.executable)
try:
    import tensorflow as tf
    print("TensorFlow version:", tf.__version__)
except ImportError:
    print("TensorFlow not installed")

try:
    import keras
    print("Keras version:", keras.__version__)
except ImportError:
    print("Keras not installed")

try:
    import torch
    print("Torch version:", torch.__version__)
except ImportError:
    print("Torch not installed")

try:
    import transformers
    print("Transformers version:", transformers.__version__)
except ImportError:
    print("Transformers not installed")

try:
    import h5py
    print("h5py version:", h5py.__version__)
except ImportError:
    print("h5py not installed")

try:
    import joblib
    print("joblib version:", joblib.__version__)
except ImportError:
    print("joblib not installed")

try:
    import sklearn
    print("scikit-learn version:", sklearn.__version__)
except ImportError:
    print("scikit-learn not installed")
