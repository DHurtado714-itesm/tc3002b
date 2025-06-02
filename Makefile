# Makefile para ejecutar FastAPI con Uvicorn

.PHONY: model clean

# Ejecuta el servidor en modo desarrollo
model:
	uvicorn main:app --reload

# Limpia archivos temporales de Python
clean:
	find . -type f -name '*.pyc' -delete
	find . -type d -name '__pycache__' -exec rm -r {} +

# Instala dependencias del proyecto si usas requirements.txt
install:
	pip install -r requirements.txt
