from fastapi import FastAPI, File, Request, UploadFile, HTTPException
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
import tensorflow as tf
import numpy as np
from PIL import Image
import io

app = FastAPI()
templates = Jinja2Templates(directory="templates")

# Clases del dataset
CLASSES = ['buildings', 'forest', 'glacier', 'mountain', 'sea', 'street']

# Cargar el modelo
model = tf.keras.models.load_model('intel_image_model.keras')

def preprocess_image(image: Image.Image):
    # Redimensionar y normalizar
    image = image.resize((150, 150))
    image_array = np.array(image) / 255.0
    image_array = np.expand_dims(image_array, axis=0)  # Añadir dimensión de lote
    return image_array

@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.post("/predict")
async def predict_image(file: UploadFile = File(...)):
    # Verificar tipo de archivo
    if not file:
        raise HTTPException(status_code=400, detail="El archivo debe ser una imagen")
    
    # Leer y procesar la imagen
    try:
        image_data = await file.read()
        image = Image.open(io.BytesIO(image_data)).convert('RGB')
        image_array = preprocess_image(image)
        
        # Realizar predicción
        predictions = model.predict(image_array)
        predicted_class_index = np.argmax(predictions[0])
        confidence = float(predictions[0][predicted_class_index])
        
        return {
            "class": CLASSES[predicted_class_index],
            "confidence": round(confidence * 100, 2)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error procesando la imagen: {str(e)}")