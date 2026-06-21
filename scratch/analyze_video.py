"""
Video Feature Analyzer - Run this on your actual AI video and camera video
to get real feature measurements for calibration.

Usage:
  python scratch\analyze_video.py "path\to\your\video.mp4"
"""
import sys
import os
import numpy as np
import cv2

def analyze_video(video_path):
    NUM_FRAMES = 20
    IMG_SIZE = 224

    print(f"\n{'='*60}")
    print(f"Analyzing: {os.path.basename(video_path)}")
    print(f"{'='*60}")

    cap = cv2.VideoCapture(video_path)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    fps = cap.get(cv2.CAP_PROP_FPS)
    duration = total_frames / fps if fps > 0 else 0

    print(f"Duration : {duration:.2f}s  |  FPS: {fps:.1f}  |  Frames: {total_frames}")

    indices = np.linspace(0, max(total_frames - 1, 0), NUM_FRAMES, dtype=int)
    frames = []
    for idx in indices:
        cap.set(cv2.CAP_PROP_POS_FRAMES, int(idx))
        ret, frame = cap.read()
        if not ret:
            frames.append(np.zeros((IMG_SIZE, IMG_SIZE, 3), dtype=np.float32))
            continue
        frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        frame = cv2.resize(frame, (IMG_SIZE, IMG_SIZE))
        frames.append(frame.astype(np.float32) / 255.0)
    cap.release()

    frames_arr = np.array(frames)

    # --- Feature 1: Temporal mean (frame-to-frame pixel change) ---
    diffs = [float(np.mean(np.abs(frames_arr[i].astype(np.float64) - frames_arr[i-1].astype(np.float64))))
             for i in range(1, len(frames_arr))]
    temporal_mean = float(np.mean(diffs)) if diffs else 0.0
    temporal_std  = float(np.std(diffs))  if diffs else 0.0

    # --- Feature 2: Spatial noise floor ---
    noise_levels = []
    for frame in frames_arr:
        gray = np.mean(frame, axis=2).astype(np.float32)
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        noise_levels.append(float(np.std(gray - blurred)))
    avg_noise = float(np.mean(noise_levels))

    # --- Feature 3: Edge sharpness variance (AI tends to be too crisp/uniform) ---
    edge_vars = []
    for frame in frames_arr:
        gray = (np.mean(frame, axis=2) * 255).astype(np.uint8)
        edges = cv2.Canny(gray, 50, 150)
        edge_vars.append(float(np.mean(edges)))
    avg_edge_density = float(np.mean(edge_vars))
    edge_density_std  = float(np.std(edge_vars))

    # --- Feature 4: Color saturation ---
    saturations = []
    for frame in frames_arr:
        rgb_max = np.max(frame, axis=2)
        rgb_min = np.min(frame, axis=2)
        saturations.append(float(np.mean(rgb_max - rgb_min)))
    avg_saturation = float(np.mean(saturations))

    # --- Feature 5: Inter-frame gradient variance ---
    # AI videos often have very consistent gradient patterns across frames
    gradient_means = []
    for frame in frames_arr:
        gray = (np.mean(frame, axis=2) * 255).astype(np.uint8)
        gx = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
        gy = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)
        mag = np.sqrt(gx**2 + gy**2)
        gradient_means.append(float(np.mean(mag)))
    gradient_std = float(np.std(gradient_means))  # how much gradients vary across frames

    print(f"\n--- MEASURED FEATURES ---")
    print(f"temporal_mean      : {temporal_mean:.5f}  (frame-to-frame pixel change)")
    print(f"temporal_std       : {temporal_std:.5f}   (consistency of motion)")
    print(f"avg_noise          : {avg_noise:.5f}  (spatial high-freq noise)")
    print(f"avg_edge_density   : {avg_edge_density:.3f}   (edge content level)")
    print(f"edge_density_std   : {edge_density_std:.3f}   (how much edges vary across frames)")
    print(f"avg_saturation     : {avg_saturation:.5f}  (color saturation)")
    print(f"gradient_std       : {gradient_std:.3f}   (gradient variation across frames)")

    # Apply current thresholds (for debugging)
    temporal_ai = max(0.0, 1.0 - min(1.0, temporal_mean / 0.04)) * 100.0
    noise_ai    = max(0.0, 1.0 - min(1.0, avg_noise    / 0.018)) * 100.0
    feature_score = 0.5 * temporal_ai + 0.5 * noise_ai

    print(f"\n--- CURRENT SCORING (with raw_prob=0.58 biased) ---")
    print(f"temporal_ai_score  : {temporal_ai:.1f}%")
    print(f"noise_ai_score     : {noise_ai:.1f}%")
    print(f"feature_score      : {feature_score:.1f}%")
    print(f"VERDICT            : {'🚨 DEEPFAKE' if feature_score > 50 else '✅ CAMERA VERIFIED'}")

    return {
        "temporal_mean": round(temporal_mean, 5),
        "temporal_std": round(temporal_std, 5),
        "avg_noise": round(avg_noise, 5),
        "avg_edge_density": round(avg_edge_density, 3),
        "edge_density_std": round(edge_density_std, 3),
        "avg_saturation": round(avg_saturation, 5),
        "gradient_std": round(gradient_std, 3),
        "feature_score": round(feature_score, 1),
    }

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python analyze_video.py <video_path> [video_path2] ...")
        print("Example:")
        print("  python analyze_video.py ai_video.mp4 camera_video.mp4")
        sys.exit(1)

    results = {}
    for path in sys.argv[1:]:
        if not os.path.exists(path):
            print(f"File not found: {path}")
            continue
        results[path] = analyze_video(path)

    print("\n\n--- SUMMARY TABLE ---")
    print(f"{'File':<30} {'temporal_mean':>14} {'avg_noise':>10} {'feature_score':>14}")
    print("-" * 72)
    for path, r in results.items():
        name = os.path.basename(path)[:30]
        print(f"{name:<30} {r['temporal_mean']:>14.5f} {r['avg_noise']:>10.5f} {r['feature_score']:>14.1f}%")
