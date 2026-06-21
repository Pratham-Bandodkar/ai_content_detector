import keras

try:
    print("Loading video model...")
    model = keras.models.load_model("models/video/ai_video_detector.h5")
    print("Video model loaded successfully!")
    model.summary()
except Exception as e:
    import traceback
    traceback.print_exc()
