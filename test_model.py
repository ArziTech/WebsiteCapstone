import sys
import json
import cv2
import numpy as np
from keras.models import load_model

def predict_face(image_path):
    try:
        img = cv2.imread(image_path)
        if img is None:
            return {"error": "Invalid image file"}

        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        img = cv2.resize(img, (160, 160))
        img = np.expand_dims(img, axis=0) / 255.0

        model = load_model('face_recognition_cnn.h5')
        prediction = model.predict(img)
        predicted_class = int(np.argmax(prediction, axis=1)[0])
        classes = {0: "Nesha", 1: "Syauqi"}
        return {"prediction": classes.get(predicted_class, "Unknown")}
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(json.dumps({"error": "Usage: python test_model.py <image_path>"}))
    else:
        result = predict_face(sys.argv[1])
        print(result)