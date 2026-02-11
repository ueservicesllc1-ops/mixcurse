# 🔥 Configuración de Firebase

## 📋 **Pasos para configurar Firebase:**

### **1. Crear proyecto en Firebase:**
1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Clic en **"Crear proyecto"**
3. Nombre: `multitrack-player`
4. Habilita **Google Analytics** (opcional)
5. Clic en **"Crear proyecto"**

### **2. Configurar Firestore Database:**
1. En el menú lateral, clic en **"Firestore Database"**
2. Clic en **"Crear base de datos"**
3. Selecciona **"Comenzar en modo de prueba"**
4. Elige una ubicación (ej: `us-central1`)
5. Clic en **"Siguiente"**

### **3. Configurar Storage:**
1. En el menú lateral, clic en **"Storage"**
2. Clic en **"Comenzar"**
3. Selecciona **"Comenzar en modo de prueba"**
4. Elige la misma ubicación que Firestore
5. Clic en **"Siguiente"**

### **4. Obtener configuración:**
1. En el menú lateral, clic en **"Configuración del proyecto"** (⚙️)
2. Scroll hacia abajo hasta **"Tus apps"**
3. Clic en **"</>"** (Web)
4. Nombre de la app: `multitrack-web`
5. Clic en **"Registrar app"**
6. **Copia la configuración** que aparece

### **5. Configurar la app móvil:**
1. En **"Tus apps"**, clic en **"Agregar app"**
2. Selecciona **"</>"** (Web) otra vez
3. Nombre: `multitrack-mobile`
4. Clic en **"Registrar app"**
5. **Copia la configuración** que aparece

## 🔧 **Configurar archivos:**

### **1. En `multitrack-mobile/services/FirebaseService.js`:**
```javascript
const firebaseConfig = {
  apiKey: "tu-api-key-aqui",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto-id",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789",
  appId: "tu-app-id"
};
```

### **2. En tu `web-app.html` (línea ~4735):**
```javascript
const firebaseConfig = {
  apiKey: "tu-api-key-aqui",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto-id",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789",
  appId: "tu-app-id"
};
```

## 📁 **Estructura de Firestore:**

### **Colección: `songs`**
```json
{
  "songId": {
    "name": "Mi Canción",
    "artist": "Mi Artista",
    "tempo": 128,
    "key": "C",
    "timeSignature": "4/4",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "tracks": [
      {
        "name": "Drums",
        "fileName": "drums.mp3",
        "size": 5242880,
        "type": "audio/mpeg"
      }
    ]
  }
}
```

## 🗂️ **Estructura de Storage:**

```
songs/
├── songId1/
│   └── tracks/
│       ├── drums.mp3
│       ├── bass.mp3
│       └── guitar.mp3
└── songId2/
    └── tracks/
        ├── vocals.mp3
        └── backing.mp3
```

## 🔐 **Reglas de Seguridad:**

### **Firestore (Reglas):**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /songs/{songId} {
      allow read: if true; // Permitir lectura a todos
      allow write: if request.auth != null; // Solo usuarios autenticados pueden escribir
    }
  }
}
```

### **Storage (Reglas):**
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /songs/{songId}/tracks/{trackId} {
      allow read: if true; // Permitir lectura a todos
      allow write: if request.auth != null; // Solo usuarios autenticados pueden escribir
    }
  }
}
```

## ✅ **Verificar configuración:**

### **1. Probar Firestore:**
```javascript
// En la consola del navegador
firebase.firestore().collection('songs').get().then(snapshot => {
  console.log('Firestore conectado:', snapshot.size, 'documentos');
});
```

### **2. Probar Storage:**
```javascript
// En la consola del navegador
firebase.storage().ref('test').putString('test').then(() => {
  console.log('Storage conectado');
});
```

## 🚀 **Después de configurar:**

1. **Reinicia la app móvil**
2. **Recarga la página web**
3. **Sube una canción desde la web**
4. **Descárgala en la app móvil**

¡El sistema estará completamente funcional! 🎵



