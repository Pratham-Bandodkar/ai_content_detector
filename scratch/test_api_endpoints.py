import os
import sys
import urllib.request
import urllib.parse
import mimetypes
import json
from PIL import Image
import numpy as np

# Helper to construct multipart/form-data payload
def encode_multipart_formdata(fields, files):
    boundary = b'----WebKitFormBoundary7MA4YWxkTrZu0gW'
    lines = []
    for name, value in fields.items():
        lines.append(b'--' + boundary)
        lines.append(f'Content-Disposition: form-data; name="{name}"'.encode('utf-8'))
        lines.append(b'')
        lines.append(value.encode('utf-8'))
    for name, (filename, content) in files.items():
        lines.append(b'--' + boundary)
        lines.append(f'Content-Disposition: form-data; name="{name}"; filename="{filename}"'.encode('utf-8'))
        mimetype = mimetypes.guess_type(filename)[0] or 'application/octet-stream'
        lines.append(f'Content-Type: {mimetype}'.encode('utf-8'))
        lines.append(b'')
        lines.append(content)
    lines.append(b'--' + boundary + b'--')
    lines.append(b'')
    body = b'\r\n'.join(lines)
    content_type = f'multipart/form-data; boundary={boundary.decode("utf-8")}'
    return content_type, body

def post_multipart(url, fields, files):
    content_type, body = encode_multipart_formdata(fields, files)
    req = urllib.request.Request(url, data=body)
    req.add_header('Content-Type', content_type)
    try:
        with urllib.request.urlopen(req) as res:
            return json.loads(res.read().decode('utf-8'))
    except Exception as e:
        if hasattr(e, 'read'):
            return {"error": e.read().decode('utf-8')}
        return {"error": str(e)}

# 1. Test Text Detector Route
print("Testing TEXT API...")
text_data = json.dumps({'text': 'This is a test text to run the AI content detector. The text must be at least fifty characters, so we write some sentences that are organic or AI generated to meet the length requirements.'}).encode('utf-8')
req = urllib.request.Request('http://localhost:3000/api/detect/text', data=text_data, headers={'Content-Type': 'application/json'})
try:
    with urllib.request.urlopen(req) as res:
        print("TEXT API Result:", json.loads(res.read().decode('utf-8')))
except Exception as e:
    print("TEXT API Error:", str(e))

# 2. Test Image Detector Route
print("\nTesting IMAGE API...")
img_path = "temp_api_image.jpg"
Image.new("RGB", (224, 224), color="red").save(img_path)
with open(img_path, "rb") as f:
    img_content = f.read()
img_res = post_multipart("http://localhost:3000/api/detect/image", {}, {"file": ("temp_api_image.jpg", img_content)})
print("IMAGE API Result:", img_res)
if os.path.exists(img_path):
    os.remove(img_path)

# 3. Test Audio Detector Route
print("\nTesting AUDIO API...")
audio_path = "temp_api_audio.wav"
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
with open(audio_path, "rb") as f:
    audio_content = f.read()
audio_res = post_multipart("http://localhost:3000/api/detect/audio", {}, {"file": ("temp_api_audio.wav", audio_content)})
print("AUDIO API Result:", audio_res)
if os.path.exists(audio_path):
    os.remove(audio_path)

# 4. Test Video Detector Route
print("\nTesting VIDEO API...")
video_path = "temp_api_video.mp4"
import cv2
fourcc = cv2.VideoWriter_fourcc(*'mp4v')
out = cv2.VideoWriter(video_path, fourcc, 10.0, (224, 224))
for _ in range(30):
    frame = np.zeros((224, 224, 3), dtype=np.uint8)
    out.write(frame)
out.release()
with open(video_path, "rb") as f:
    video_content = f.read()
video_res = post_multipart("http://localhost:3000/api/detect/video", {}, {"file": ("temp_api_video.mp4", video_content)})
print("VIDEO API Result:", video_res)
if os.path.exists(video_path):
    os.remove(video_path)
