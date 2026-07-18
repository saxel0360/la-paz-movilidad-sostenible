# 🚲 La Paz - Movilidad Sostenible

Aplicación móvil desarrollada con **React Native + Expo** y un backend construido con **Django + Django REST Framework**.

---

# Tecnologías

## Frontend

- React Native
- Expo SDK 54
- Node.js

## Backend

- Python 3.12
- Django 6
- Django REST Framework

---

# Requisitos

Antes de comenzar instala:

- Git
- Node.js (versión LTS)
- Python 3.12 o superior
- Expo Go (Android/iOS)
- Visual Studio Code (opcional)

---

# Clonar el proyecto

```bash
git clone git@github.com:saxel0360/la-paz-movilidad-sostenible.git

cd la-paz-movilidad-sostenible
```

---

# Frontend

Entrar al proyecto.

```bash
cd frontend
```

Instalar dependencias

```bash
npm install
```

Ejecutar Expo

```bash
npm start
```

o

```bash
npx expo start
```

Escanear el código QR con **Expo Go**.

---

# Backend

## Linux / macOS

Entrar al backend

```bash
cd backend
```

Crear el entorno virtual

```bash
python3 -m venv .venv
```

Activarlo

```bash
source .venv/bin/activate
```

Instalar dependencias

```bash
pip install -r requirements.txt
```

Aplicar migraciones

```bash
python manage.py migrate
```

Iniciar el servidor

```bash
python manage.py runserver
```

---

## Windows (PowerShell)

Entrar al backend

```powershell
cd backend
```

Crear el entorno virtual

```powershell
python -m venv .venv
```

Activarlo

```powershell
.venv\Scripts\Activate.ps1
```

Instalar dependencias

```powershell
pip install -r requirements.txt
```

Aplicar migraciones

```powershell
python manage.py migrate
```

Iniciar el servidor

```powershell
python manage.py runserver
```

---

## Windows (CMD)

```cmd
cd backend

python -m venv .venv

.venv\Scripts\activate.bat

pip install -r requirements.txt

python manage.py migrate

python manage.py runserver
```

---

El backend estará disponible en

```
http://127.0.0.1:8000
```

---

# Estructura del proyecto

```
la-paz-movilidad-sostenible/

│
├── backend/
│   ├── backend/
│   ├── manage.py
│   ├── requirements.txt
│   └── .venv/
│
├── frontend/
│   ├── assets/
│   ├── App.js
│   ├── package.json
│   └── node_modules/
│
├── .gitignore
└── README.md
```

---

# Instalación desde cero

## 1. Clonar el repositorio

```bash
git clone git@github.com:saxel0360/la-paz-movilidad-sostenible.git

cd la-paz-movilidad-sostenible
```

## 2. Configurar el backend

### Linux / macOS

```bash
cd backend

python3 -m venv .venv

source .venv/bin/activate

pip install -r requirements.txt

python manage.py migrate

python manage.py runserver
```

### Windows

```powershell
cd backend

python -m venv .venv

.venv\Scripts\Activate.ps1

pip install -r requirements.txt

python manage.py migrate

python manage.py runserver
```

## 3. Configurar el frontend

Abrir una nueva terminal

```bash
cd frontend

npm install

npm start
```

Escanear el código QR utilizando **Expo Go**.

---

# Dependencias del backend

Todas las dependencias se encuentran en:

```
backend/requirements.txt
```

Para instalarlas:

```bash
pip install -r requirements.txt
```

---

# Dependencias del frontend

Todas las dependencias se encuentran en:

```
frontend/package.json
```

Para instalarlas:

```bash
npm install
```

---

# Archivos que NO deben subirse a GitHub

Estos archivos están ignorados mediante `.gitignore`.

```
backend/.venv/
backend/db.sqlite3
backend/__pycache__/

frontend/node_modules/
frontend/.expo/

.env
.vscode/
```

---

# Actualizar dependencias del backend

Si se instala una nueva librería:

```bash
pip freeze > requirements.txt
```

Esto actualizará el archivo para que cualquier desarrollador pueda instalar exactamente las mismas versiones.

---

# Actualizar dependencias del frontend

Después de instalar un paquete:

```bash
npm install nombre-del-paquete
```

El archivo `package.json` se actualizará automáticamente.

---

# Autores

Proyecto desarrollado para **La Paz - Movilidad Sostenible**.

# Desarrollo del Backend (Django + Django REST Framework)

Esta sección describe el flujo recomendado para crear nuevas aplicaciones dentro del backend.

---

# Activar el entorno virtual

Antes de realizar cualquier cambio en el backend, activa el entorno virtual.

## Linux / macOS

```bash
cd backend

source .venv/bin/activate
```

## Windows (PowerShell)

```powershell
cd backend

.venv\Scripts\Activate.ps1
```

---

# Crear una nueva aplicación en DJANGOREST

Ubicarse dentro del directorio `backend`.

```bash
cd backend
```

Crear una aplicación.

Ejemplo:

```bash
python manage.py startapp usuarios
```

Esto generará una estructura similar a:

```
usuarios/

├── admin.py
├── apps.py
├── migrations/
├── models.py
├── serializers.py
├── tests.py
├── urls.py
├── views.py
└── __init__.py
```

> **Nota:** Django no crea `serializers.py` ni `urls.py` automáticamente. Estos archivos deben crearse manualmente cuando se utilice Django REST Framework.

---

# Registrar la aplicación

Agregar la nueva aplicación en:

```
backend/settings.py
```

Dentro de `INSTALLED_APPS`.

```python
INSTALLED_APPS = [
    ...
    "rest_framework",
    "usuarios",
]
```

---

# Crear modelos

Ejemplo (`usuarios/models.py`)

```python
from django.db import models

class Usuario(models.Model):
    nombre = models.CharField(max_length=100)
    correo = models.EmailField(unique=True)

    def __str__(self):
        return self.nombre
```

---

# Crear migraciones

Cada vez que se modifique un modelo ejecutar:

```bash
python manage.py makemigrations
```

Después aplicar las migraciones:

```bash
python manage.py migrate
```

---

# Registrar modelos en el administrador

En `admin.py`

```python
from django.contrib import admin
from .models import Usuario

admin.site.register(Usuario)
```

Crear un superusuario.

```bash
python manage.py createsuperuser
```

Ejecutar el servidor.

```bash
python manage.py runserver
```

Ingresar a:

```
http://127.0.0.1:8000/admin/
```

---

# Crear un Serializer

Crear el archivo:

```
usuarios/serializers.py
```

Ejemplo:

```python
from rest_framework import serializers
from .models import Usuario

class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = "__all__"
```

---

# Crear una Vista

Ejemplo (`usuarios/views.py`)

```python
from rest_framework import viewsets

from .models import Usuario
from .serializers import UsuarioSerializer

class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
```

---

# Crear las URLs de la aplicación

Crear:

```
usuarios/urls.py
```

```python
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import UsuarioViewSet

router = DefaultRouter()
router.register(r"usuarios", UsuarioViewSet)

urlpatterns = [
    path("", include(router.urls)),
]
```

---

# Registrar las URLs principales

Editar:

```
backend/urls.py
```

```python
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("usuarios.urls")),
]
```

---

# Ejecutar el servidor

```bash
python manage.py runserver
```

La API estará disponible en

```
http://127.0.0.1:8000/api/
```

---

# Probar la API

Si se utiliza un `ModelViewSet`, Django REST Framework genera automáticamente los siguientes endpoints.

```
GET      /api/usuarios/
POST     /api/usuarios/
GET      /api/usuarios/{id}/
PUT      /api/usuarios/{id}/
PATCH    /api/usuarios/{id}/
DELETE   /api/usuarios/{id}/
```

---

# Actualizar dependencias

Cuando se instale una nueva librería:

```bash
pip install nombre-paquete
```

Actualizar el archivo de dependencias.

```bash
pip freeze > requirements.txt
```

De esta forma cualquier desarrollador podrá instalar exactamente las mismas versiones.

---

# Buenas prácticas

- Crear una aplicación por cada módulo funcional (usuarios, rutas, transporte, reportes, etc.).
- Mantener la lógica de negocio en cada aplicación correspondiente.
- Utilizar `ModelSerializer` cuando sea posible.
- Versionar las APIs mediante prefijos (por ejemplo, `/api/v1/`) si el proyecto crece.
- No subir al repositorio:
  - `.venv/`
  - `db.sqlite3`
  - `__pycache__/`
  - `.env`
