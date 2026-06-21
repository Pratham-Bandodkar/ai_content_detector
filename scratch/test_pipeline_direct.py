import os
import sys
import numpy as np
from PIL import Image

# Add backend to path so we can import pipeline
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))
import pipeline  # type: ignore

print("--- Testing Image Detector ---")
img_path = "test_image.jpg"
Image.new("RGB", (224, 224), color="blue").save(img_path)
try:
    img_res = pipeline.detect_image(img_path)
    print("Image Detector Result:", img_res)
except Exception as e:
    import traceback
    print("Image Detector Error:", str(e))
    traceback.print_exc()
finally:
    if os.path.exists(img_path):
        os.remove(img_path)

print("\n--- Testing Audio Detector ---")
audio_path = "test_audio.wav"
# Generate a simple 1-second sine wave at 22050Hz
import wave, struct
sample_rate = 22050
duration = 1.0
t = np.linspace(0, duration, int(sample_rate * duration), endpoint=False)
data = np.sin(2 * np.pi * 440 * t) * 32767
data = data.astype(np.int16)
with wave.open(audio_path, "wb") as w:
    w.setnchannels(1)
    w.setsampwidth(2)
    w.setframerate(sample_rate)
    for sample in data:
        w.writeframes(struct.pack('h', sample))
try:
    audio_res = pipeline.detect_audio(audio_path)
    print("Audio Detector Result:", audio_res)
except Exception as e:
    import traceback
    print("Audio Detector Error:", str(e))
    traceback.print_exc()
finally:
    if os.path.exists(audio_path):
        os.remove(audio_path)

print("\n--- Testing Video Detector ---")
video_path = "test_video.mp4"
import cv2
fourcc = cv2.VideoWriter_fourcc(*'mp4v')
out = cv2.VideoWriter(video_path, fourcc, 10.0, (224, 224))
for _ in range(30): # 3 seconds
    frame = np.zeros((224, 224, 3), dtype=np.uint8)
    out.write(frame)
out.release()
try:
    video_res = pipeline.detect_video(video_path)
    print("Video Detector Result:", video_res)
except Exception as e:
    import traceback
    print("Video Detector Error:", str(e))
    traceback.print_exc()
finally:
    if os.path.exists(video_path):
        os.remove(video_path)
