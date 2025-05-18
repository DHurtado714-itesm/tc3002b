# Preprocesamiento y Organización del Dataset de Imágenes

Este proyecto tiene como objetivo preparar un conjunto de datos de imágenes de células para su uso en modelos de clasificación con redes neuronales convolucionales. El procesamiento se realizó desde Google Colab utilizando imágenes organizadas en Google Drive.

---

## ✅ Requisitos: Semana 2

### 📁 1. Generación o selección del set de datos

- Se partió de un dataset de imágenes organizado en carpetas por clase: `EOSINOPHIL`, `LYMPHOCYTE`, `MONOCYTE`, `NEUTROPHIL`.
- Las imágenes fueron combinadas de las carpetas originales `train/` y `test/`, y redistribuidas manualmente en una nueva estructura:

60% → train/
20% → valid/
20% → test/

Cada carpeta contiene subcarpetas por clase.

---

### ✂️ 2. Separación del set de datos

- Se realizó una **división manual** siguiendo la proporción 60/20/20.
- Las imágenes fueron organizadas directamente en carpetas (`train`, `valid`, `test`) manteniendo la distribución de clases.

---

## 🔧 Preprocesado de los datos

### 📐 Escalamiento

Se aplicó escalamiento a todas las imágenes dividiendo los valores de píxeles entre 255:

```python
rescale=1./255
```

Esto normaliza los valores de entrada al rango [0, 1], necesario para modelos de deep learning.

### 🔁 Aumentación de datos (solo entrenamiento)

Para mejorar la generalización del modelo y evitar overfitting, se aplicó data augmentation al conjunto de entrenamiento:

```python
train_datagen = ImageDataGenerator(
    rescale=1./255,
    rotation_range=20,
    width_shift_range=0.2,
    height_shift_range=0.2,
    shear_range=0.3,
    zoom_range=0.3,
    horizontal_flip=True
)
```

Esto genera versiones aumentadas de cada imagen en tiempo real durante el entrenamiento.


### 📂 Organización de carpetas esperada
El conjunto de datos se organiza en carpetas por clase, con subcarpetas para entrenamiento, validación y prueba. La estructura es la siguiente:

```bash
dataset/
├── train/
│   ├── EOSINOPHIL/
│   ├── LYMPHOCYTE/
│   └── ...
├── valid/
│   ├── EOSINOPHIL/
│   ├── ...
└── test/
    ├── EOSINOPHIL/
    └── ...
```
---

## Entregable

1. Week 2: El archivo se encuentra en este repositorio, el enlace es el siguiente:
   - [Google Collab Notebook](https://github.com/DHurtado714-itesm/tc3002b/blob/main/data-processing.ipynb)