"""
Test video model label orientation by running blank/solid vs synthetic pattern videos.
Output close to 1.0 for blank means label=1 = "Real" OR model biased.
"""
import sys, os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

import numpy as np
import cv2
import h5py
import keras

MODELS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "models"))
NUM_FRAMES = 20
IMG_SIZE = 224

def build_and_load_model():
    inputs = keras.layers.Input(shape=(None, IMG_SIZE, IMG_SIZE, 3), name="input_1")
    backbone = keras.applications.EfficientNetB0(include_top=False, weights=None, input_shape=(IMG_SIZE, IMG_SIZE, 3))
    x = keras.layers.TimeDistributed(backbone, name="time_distributed")(inputs)
    x = keras.layers.TimeDistributed(keras.layers.GlobalAveragePooling2D(), name="time_distributed_1")(x)
    lstm_out = keras.layers.LSTM(32, name="lstm")(x)
    gap_out = keras.layers.GlobalAveragePooling1D(name="global_average_pooling1d")(x)
    concat = keras.layers.concatenate([gap_out, lstm_out], name="concatenate")
    d = keras.layers.Dense(32, activation="relu", name="dense")(concat)
    drop = keras.layers.Dropout(0.5, name="dropout")(d)
    outputs = keras.layers.Dense(1, activation="sigmoid", name="dense_1")(drop)
    model = keras.models.Model(inputs=inputs, outputs=outputs)
    dummy = np.zeros((1, 5, IMG_SIZE, IMG_SIZE, 3))
    _ = model(dummy)
    
    h5_path = os.path.join(MODELS_DIR, "video", "ai_video_detector.h5")
    model_weights_dict = {w.path: w for w in model.weights}
    with h5py.File(h5_path, "r") as f:
        h5_data = {}
        def collect(name, obj):
            if isinstance(obj, h5py.Dataset):
                h5_data[name.replace(":0", "")] = obj[()]
        f.visititems(collect)
    
    matched = 0
    for path, w in model_weights_dict.items():
        for h5_key, val in h5_data.items():
            norm_h5 = h5_key.replace("depthwise_kernel", "kernel")
            h5_parts = norm_h5.split("/")
            if path.endswith(norm_h5) or (len(h5_parts) >= 2 and "/".join(h5_parts[-2:]) in path):
                if w.shape == val.shape:
                    w.assign(val)
                    matched += 1
                break
    print(f"Matched {matched} weight tensors")
    return model

model = build_and_load_model()

def make_video_frames(frame_type="blank"):
    frames = []
    for i in range(NUM_FRAMES):
        if frame_type == "blank":
            frame = np.zeros((IMG_SIZE, IMG_SIZE, 3), dtype=np.float32)
        elif frame_type == "white":
            frame = np.ones((IMG_SIZE, IMG_SIZE, 3), dtype=np.float32)
        elif frame_type == "noise":
            frame = np.random.random((IMG_SIZE, IMG_SIZE, 3)).astype(np.float32)
        elif frame_type == "gradient":
            frame = np.zeros((IMG_SIZE, IMG_SIZE, 3), dtype=np.float32)
            for y in range(IMG_SIZE):
                frame[y, :, 0] = y / IMG_SIZE  # red gradient
        frames.append(frame)
    return np.array(frames)[np.newaxis]  # (1, NUM_FRAMES, 224, 224, 3)

for ftype in ["blank", "white", "noise", "gradient"]:
    frames = make_video_frames(ftype)
    pred = model.predict(frames, verbose=0)
    raw_score = float(pred[0][0])
    print(f"\n[{ftype}] raw pred = {raw_score:.4f}")
    print(f"  If 1=AI: ai_score={raw_score*100:.1f}%, label={'AI' if raw_score>0.5 else 'Real'}")
    print(f"  If 1=Real: ai_score={(1-raw_score)*100:.1f}%, label={'AI' if (1-raw_score)>0.5 else 'Real'}")

print("\nDone.")
