"""
AI Content Detection Pipeline Orchestrator
Accepts: --type [text|image|audio|video] --input <path_or_text>
Outputs: JSON to stdout
"""

import sys
import os
import json
import argparse

# Ensure the backend directory is in sys.path so local imports always succeed
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

BASE_DIR = os.path.dirname(BACKEND_DIR)
MODELS_DIR = os.path.join(BASE_DIR, "models")


def detect_text(text):
    import joblib
    import torch
    import torch.nn.functional as F
    import math
    import re
    from transformers import RobertaTokenizer, RobertaForSequenceClassification
    from gltr_features import get_gltr_token_stats, normalize_gltr_stats

    # ================= CONFIG =================
    ROBERTA_PATH = r"c:\Users\Loq\Desktop\Project\PROJECT(TEXT)\models\roberta_finetuned"
    if not os.path.exists(ROBERTA_PATH):
        ROBERTA_PATH = os.path.join(MODELS_DIR, "text", "roberta_finetuned")

    TFIDF_MODEL_PATH = "models/logistic_regression_model.pkl"
    if not os.path.exists(TFIDF_MODEL_PATH):
        TFIDF_MODEL_PATH = os.path.join(MODELS_DIR, "text", "logistic_regression_model.pkl")

    TFIDF_VEC_PATH = "models/tfidf_vectorizer.pkl"
    if not os.path.exists(TFIDF_VEC_PATH):
        TFIDF_VEC_PATH = os.path.join(MODELS_DIR, "text", "tfidf_vectorizer.pkl")

    GLTR_MODEL_PATH = "models/gltr_classifier_model.pkl"
    if not os.path.exists(GLTR_MODEL_PATH):
        GLTR_MODEL_PATH = os.path.join(MODELS_DIR, "text", "gltr_classifier_model.pkl")

    SCALE = 10.0
    W1 = 0.3 * SCALE
    W2 = 0.2 * SCALE
    W3 = 0.5 * SCALE
    BIAS = -5.0

    # Force CPU for text detection to prevent CUDA DLL loading limits & Access Violations on Windows child processes
    device = torch.device("cpu")
    results = {}

    def load_all_models():
        # 1. RoBERTa
        try:
            roberta_tokenizer = RobertaTokenizer.from_pretrained(ROBERTA_PATH)
            roberta_model = RobertaForSequenceClassification.from_pretrained(ROBERTA_PATH)
            roberta_model.to(device)
            roberta_model.eval()
        except Exception as e:
            results["roberta_error"] = str(e)
            roberta_tokenizer, roberta_model = None, None

        # 2. TF-IDF
        try:
            tfidf_model = joblib.load(TFIDF_MODEL_PATH)
            tfidf_vec = joblib.load(TFIDF_VEC_PATH)
        except Exception as e:
            results["tfidf_error"] = str(e)
            tfidf_model, tfidf_vec = None, None

        # 3. GLTR Classifier
        try:
            gltr_classifier = joblib.load(GLTR_MODEL_PATH)
        except Exception as e:
            results["gltr_error"] = str(e)
            gltr_classifier = None

        return {
            "roberta": (roberta_tokenizer, roberta_model),
            "tfidf": (tfidf_vec, tfidf_model),
            "gltr": gltr_classifier
        }

    def get_roberta_prob(t, tokenizer, model):
        if not model: return 0.5
        inputs = tokenizer(t, return_tensors="pt", truncation=True, padding=True)
        inputs = {k: v.to(device) for k, v in inputs.items()}
        with torch.no_grad():
            logits = model(**inputs).logits
            probs = F.softmax(logits, dim=1)
        return float(probs[0][1].item())

    def get_tfidf_prob(t, vec, model):
        if not model: return 0.5
        v = vec.transform([t])
        return float(model.predict_proba(v)[0][1])

    def get_gltr_prob(t, classifier):
        try:
            raw = get_gltr_token_stats(t)
            norm = normalize_gltr_stats(raw)
            if classifier:
                feat = [[norm['top_10_ratio'], norm['top_100_ratio'], norm['top_1000_ratio'], norm['outside_ratio']]]
                return float(classifier.predict_proba(feat)[0][1])
            return float(norm['top_10_ratio'])
        except Exception as e:
            if "gltr_error" not in results:
                results["gltr_error"] = str(e)
            return 0.5

    def ensemble_logic(p_roberta, p_gltr, p_tfidf):
        z = (W1 * p_roberta) + (W2 * p_gltr) + (W3 * p_tfidf) + BIAS
        return 1 / (1 + math.exp(-z))

    # Load models
    models = load_all_models()

    # 1. Component Probabilities for whole text
    p1 = get_roberta_prob(text, *models['roberta'])
    p2 = get_gltr_prob(text, models['gltr'])
    p3 = get_tfidf_prob(text, *models['tfidf'])

    # 2. Final Ensemble
    p_final = ensemble_logic(p1, p2, p3)

    results["roberta_ai_prob"] = round(p1 * 100, 2)
    results["gltr_ai_prob"] = round(p2 * 100, 2)
    results["lr_ai_prob"] = round(p3 * 100, 2)

    ai_score = round(p_final * 100, 1)
    results["ai_score"] = ai_score
    results["label"] = "AI Generated" if ai_score >= 50 else "Human Written"
    results["confidence"] = round(max(p_final, 1 - p_final) * 100, 1)

    # 3. Sentence-Level Heatmap (using ensemble per sentence)
    sentences = re.split(r'(?<=[.!?])\s+', text.strip())
    sentences = [s for s in sentences if len(s.split()) >= 3]

    sentence_scores = []
    for sent in sentences:
        try:
            sp1 = get_roberta_prob(sent, *models['roberta'])
        except:
            sp1 = p1
        try:
            sp2 = get_gltr_prob(sent, models['gltr'])
        except:
            sp2 = p2
        try:
            sp3 = get_tfidf_prob(sent, *models['tfidf'])
        except:
            sp3 = p3

        sp_final = ensemble_logic(sp1, sp2, sp3)
        sentence_scores.append({
            "text": sent,
            "score": round(sp_final * 100, 1)
        })

    results["sentence_scores"] = sentence_scores

    return results



def detect_image(image_path):
    import torch
    import torch.nn.functional as F
    import h5py
    import numpy as np
    from PIL import Image
    from transformers import SwinForImageClassification, SwinConfig

    # Build and load model
    config = SwinConfig.from_pretrained("microsoft/swin-tiny-patch4-window7-224")
    config.num_labels = 2
    config.id2label = {0: "AI", 1: "Real"}
    config.label2id = {"AI": 0, "Real": 1}
    model = SwinForImageClassification(config)
    model.eval()

    weights_path = os.path.join(MODELS_DIR, "image", "best_model.weights.h5")
    h5_weights = {}
    with h5py.File(weights_path, "r") as f:
        def collect(name, obj):
            if isinstance(obj, h5py.Dataset):
                parts = name.split("/vars/")
                if len(parts) > 1:
                    h5_weights[parts[1]] = torch.tensor(obj[()])
        f.visititems(collect)

    state_dict = model.state_dict()
    loaded = {}
    for key, val in state_dict.items():
        if key in h5_weights:
            h5_val = h5_weights[key]
            if val.shape != h5_val.shape:
                if len(val.shape) == 2 and val.shape == (h5_val.shape[1], h5_val.shape[0]):
                    h5_val = h5_val.t()
            loaded[key] = h5_val
    model.load_state_dict(loaded, strict=False)

    # Preprocess image
    img = Image.open(image_path).convert("RGB").resize((224, 224))
    img_array = np.array(img).astype(np.float32) / 255.0
    # Normalize with ImageNet mean/std
    mean = np.array([0.485, 0.456, 0.406])
    std = np.array([0.229, 0.224, 0.225])
    img_array = (img_array - mean) / std
    tensor = torch.tensor(img_array).permute(2, 0, 1).unsqueeze(0).float()

    with torch.no_grad():
        outputs = model(tensor)
    probs = F.softmax(outputs.logits, dim=-1).squeeze().numpy()

    # index 0 = AI, index 1 = Real
    ai_prob = float(probs[0])
    ai_score = round(ai_prob * 100, 1)

    return {
        "ai_score": ai_score,
        "label": "AI Generated" if ai_score > 50 else "Camera Origin",
        "confidence": round(max(ai_prob, 1 - ai_prob) * 100, 1),
        "class_probs": {"AI": round(float(probs[0]) * 100, 2), "Real": round(float(probs[1]) * 100, 2)}
    }


def detect_audio(audio_path):
    import librosa
    import numpy as np
    import pickle
    import keras
    import json as json_mod

    # Load normalization params
    with open(os.path.join(MODELS_DIR, "audio", "cnn_norm.pkl"), "rb") as f:
        norm_params = pickle.load(f)
    norm_mean, norm_std = norm_params  # (mean, std)

    # Load model config
    with open(os.path.join(MODELS_DIR, "audio", "config.json"), "r") as f:
        model_config = json_mod.load(f)
    model = keras.utils.deserialize_keras_object(model_config)
    model.load_weights(os.path.join(MODELS_DIR, "audio", "model.weights.h5"))

    # Extract Mel spectrogram (128 mels, 94 time frames)
    y, sr = librosa.load(audio_path, sr=22050, mono=True)
    mel = librosa.feature.melspectrogram(y=y, sr=sr, n_mels=128, hop_length=512, n_fft=2048)
    mel_db = librosa.power_to_db(mel, ref=np.max)

    # Resize to (128, 94)
    import cv2
    mel_resized = cv2.resize(mel_db, (94, 128), interpolation=cv2.INTER_LINEAR)

    # Normalize
    mel_normalized = (mel_resized - norm_mean) / (norm_std if norm_std != 0 else 1.0)

    # Add batch and channel dims: (1, 128, 94, 1)
    mel_input = mel_normalized[np.newaxis, :, :, np.newaxis].astype(np.float32)

    pred = model.predict(mel_input, verbose=0)
    ai_prob = float(pred[0][0])
    ai_score = round(ai_prob * 100, 1)

    return {
        "ai_score": ai_score,
        "label": "AI Synthesized" if ai_score > 50 else "Organic Speaker",
        "confidence": round(max(ai_prob, 1 - ai_prob) * 100, 1),
        "mel_shape": list(mel_resized.shape)
    }


def detect_video(video_path):
    import os
    import sys
    import numpy as np
    import cv2
    import tensorflow as tf
    from tensorflow.keras import layers, models, applications

    # --- GPU Setup ---
    # Limit GPU memory footprint to 2048MB to prevent pagefile/VirtualAlloc exhaustion on laptops,
    # falling back to memory growth if limits are already initialized.
    gpus = tf.config.list_physical_devices('GPU')
    if gpus:
        try:
            for gpu in gpus:
                tf.config.set_logical_device_configuration(
                    gpu,
                    [tf.config.LogicalDeviceConfiguration(memory_limit=2048)]
                )
        except RuntimeError as e:
            try:
                for gpu in gpus:
                    tf.config.experimental.set_memory_growth(gpu, True)
            except RuntimeError as e2:
                pass

    # Reset Keras session safely after GPU configuration
    tf.keras.backend.clear_session()

    IMG_SIZE = (224, 224)
    SEQ_LEN = 5
    MODEL_PATH = os.path.join(MODELS_DIR, 'video', 'ai_video_detector.h5')

    def build_model():
        inputs = tf.keras.Input(shape=(SEQ_LEN, IMG_SIZE[0], IMG_SIZE[1], 3))

        base_model = applications.EfficientNetB0(
            input_shape=(IMG_SIZE[0], IMG_SIZE[1], 3),
            include_top=False,
            weights='imagenet'
        )
        base_model.trainable = False

        x = layers.TimeDistributed(base_model)(inputs)
        x = layers.TimeDistributed(layers.GlobalAveragePooling2D())(x)

        spatial_features  = layers.GlobalAveragePooling1D()(x)
        temporal_features = layers.LSTM(32, return_sequences=False,
                                         dropout=0.0, recurrent_dropout=0.0)(x)

        aggregated = layers.Concatenate()([spatial_features, temporal_features])
        x = layers.Dense(32, activation='relu',
                         kernel_regularizer=tf.keras.regularizers.l2(0.05))(aggregated)
        x = layers.Dropout(0.6)(x)
        outputs = layers.Dense(1, activation='sigmoid')(x)

        model = models.Model(inputs, outputs)
        return model

    def extract_frames(vid_path, max_frames=50):
        cap = cv2.VideoCapture(vid_path)
        if not cap.isOpened():
            return [], 0, 0, 0

        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        fps = cap.get(cv2.CAP_PROP_FPS)
        duration_sec = total_frames / fps if fps > 0 else 0

        sample_count = min(max_frames, total_frames)
        if sample_count == 0:
            return [], total_frames, fps, duration_sec
            
        sample_indices = np.linspace(0, total_frames - 1, sample_count, dtype=int)

        frames = []
        for idx in sample_indices:
            cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
            ret, frame = cap.read()
            if not ret:
                continue
            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            frame_resized = cv2.resize(frame_rgb, IMG_SIZE)
            frames.append(frame_resized)
            del frame, frame_rgb

        cap.release()
        return frames, total_frames, fps, duration_sec

    def build_sequences(frames_list, seq_len=SEQ_LEN):
        sequences = []
        for i in range(0, len(frames_list) - seq_len + 1, seq_len):
            seq = frames_list[i : i + seq_len]
            if len(seq) == seq_len:
                sequences.append(seq)
        return sequences

    def preprocess_sequence(sequence):
        processed = []
        for frame in sequence:
            img = tf.keras.applications.efficientnet.preprocess_input(
                np.array(frame, dtype=np.float32)
            )
            processed.append(img)
        return np.stack(processed)

    # 1. Extract frames
    frames, total_frames, fps, duration = extract_frames(video_path, max_frames=50)

    if len(frames) < SEQ_LEN:
        return {
            "ai_score": 0.0,
            "label": "Not enough frames",
            "confidence": 0.0,
            "error": f"Not enough frames. Need at least {SEQ_LEN}, got {len(frames)}."
        }

    # 2. Build sequences
    sequences = build_sequences(frames, seq_len=SEQ_LEN)
    
    # 3. Load model and Run prediction
    all_probs = []
    use_cpu = False
    model = None
    
    if gpus:
        try:
            model = build_model()
            model.load_weights(MODEL_PATH)
            # Warm up
            dummy = np.zeros((1, SEQ_LEN, IMG_SIZE[0], IMG_SIZE[1], 3), dtype=np.float32)
            _ = model.predict(dummy, verbose=0)
        except Exception:
            use_cpu = True
            tf.keras.backend.clear_session()
    else:
        use_cpu = True
        
    if use_cpu:
        try:
            with tf.device('/CPU:0'):
                model = build_model()
                model.load_weights(MODEL_PATH)
        except Exception as cpu_err:
            return {"error": f"Failed to load model on CPU: {cpu_err}"}

    try:
        if use_cpu:
            with tf.device('/CPU:0'):
                for seq in sequences:
                    processed = preprocess_sequence(seq)
                    batch = np.expand_dims(processed, axis=0)
                    prob = model.predict(batch, verbose=0)[0][0]
                    all_probs.append(prob)
                    del processed, batch
        else:
            for seq in sequences:
                processed = preprocess_sequence(seq)
                batch = np.expand_dims(processed, axis=0)
                prob = model.predict(batch, verbose=0)[0][0]
                all_probs.append(prob)
                del processed, batch
    except Exception as e:
        if not use_cpu:
            tf.keras.backend.clear_session()
            all_probs = []
            try:
                with tf.device('/CPU:0'):
                    model = build_model()
                    model.load_weights(MODEL_PATH)
                    for seq in sequences:
                        processed = preprocess_sequence(seq)
                        batch = np.expand_dims(processed, axis=0)
                        prob = model.predict(batch, verbose=0)[0][0]
                        all_probs.append(prob)
                        del processed, batch
            except Exception as cpu_err:
                return {"error": f"Inference failed on CPU fallback: {cpu_err}"}
        else:
            return {"error": f"Inference failed: {e}"}

    del sequences, frames
    import gc
    gc.collect()
    tf.keras.backend.clear_session()

    # 4. Aggregate results
    mean_prob = float(np.mean(all_probs)) if all_probs else 0.5
    ai_prob = 1.0 - mean_prob
    
    threshold = 0.60
    verdict = "REAL" if mean_prob >= threshold else "AI-GENERATED"
    confidence = mean_prob if verdict == "REAL" else ai_prob

    # Scale score for UI (UI treats > 50 as Deepfake)
    if mean_prob < threshold:
        # AI! Map [0, threshold] to [100, 50]
        mapped_ai_score = 100.0 - (mean_prob / threshold) * 50.0
    else:
        # REAL! Map [threshold, 1.0] to [50, 0]
        mapped_ai_score = 50.0 * (1.0 - mean_prob) / (1.0 - threshold)

    mapped_ai_score = round(float(np.clip(mapped_ai_score, 0.0, 100.0)), 1)
    
    frame_scores = []
    for i, p in enumerate(all_probs):
        # scale individual scores too for visual timeline
        if p < threshold:
            f_score = 100.0 - (p / threshold) * 50.0
        else:
            f_score = 50.0 * (1.0 - p) / (1.0 - threshold)
        frame_scores.append({
            "frame": f"Seq-{i+1}",
            "score": round(float(np.clip(f_score, 0.0, 100.0)), 1)
        })

    return {
        "ai_score": mapped_ai_score,
        "label": "Deepfake Detected" if verdict == "AI-GENERATED" else "Camera Verified",
        "confidence": round(confidence * 100, 1),
        "duration": round(duration, 2),
        "fps": round(fps, 1),
        "total_frames": total_frames,
        "frame_scores": frame_scores,
        "debug": {
            "p_real": round(mean_prob * 100, 1),
            "p_ai": round(ai_prob * 100, 1),
            "sequences_analyzed": len(all_probs)
        }
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="AI Content Detection Pipeline")
    parser.add_argument("--type", required=True, choices=["text", "image", "audio", "video"])
    parser.add_argument("--input", required=True, help="File path or raw text string")
    args = parser.parse_args()

    try:
        if args.type == "text":
            result = detect_text(args.input)
        elif args.type == "image":
            result = detect_image(args.input)
        elif args.type == "audio":
            result = detect_audio(args.input)
        elif args.type == "video":
            result = detect_video(args.input)
        else:
            result = {"error": "Unknown type"}

        print(json.dumps(result))
    except Exception as e:
        import traceback
        print(json.dumps({"error": str(e), "traceback": traceback.format_exc()}))
        sys.exit(1)
