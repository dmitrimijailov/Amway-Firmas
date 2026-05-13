# INSTRUCCIONES PARA PUBLICAR TU PORTAL DE FIRMAS
## Carta Amway LATAM — Línea de Auspicio

---

## ¿QUÉ NECESITAS? (Todo gratis)
- Una cuenta de Google (Gmail)
- 15-20 minutos
- Computadora (no se puede desde celular)

---

## PASO 1 — Crear base de datos en Firebase
*(Aquí se guardarán las firmas de todos)*

1. Ve a: **https://console.firebase.google.com**
2. Inicia sesión con tu cuenta de Google
3. Haz clic en **"Crear un proyecto"**
4. Nombre del proyecto: `amway-firmas` → Continuar
5. Desactiva Google Analytics → **Crear proyecto**
6. Espera que cargue y haz clic en **"Continuar"**

### Activar Firestore (base de datos):
7. En el menú izquierdo, haz clic en **"Firestore Database"**
8. Clic en **"Crear base de datos"**
9. Selecciona **"Comenzar en modo de prueba"** → Siguiente
10. Elige la ubicación: **"us-east1"** → **Listo**

### Obtener tus credenciales:
11. En el menú izquierdo, haz clic en el ⚙️ (engranaje) → **"Configuración del proyecto"**
12. Baja hasta **"Tus apps"** → haz clic en **</>** (ícono web)
13. Nombre de la app: `firmas` → **Registrar app**
14. Verás un bloque de código con `firebaseConfig`. **COPIA ESE BLOQUE COMPLETO** — lo necesitarás en el Paso 2.
15. Haz clic en **"Continuar a la consola"**

---

## PASO 2 — Editar el archivo con tus credenciales

1. Abre la carpeta `amway-firmas` que descargaste
2. Entra a la carpeta `src`
3. Abre el archivo `App.js` con cualquier editor de texto (Bloc de notas, TextEdit, VS Code)
4. Busca estas líneas cerca del inicio:

```
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_PROJECT.firebaseapp.com",
  ...
};
```

5. **Reemplaza TODO ese bloque** con el `firebaseConfig` que copiaste de Firebase
6. Guarda el archivo

---

## PASO 3 — Publicar en Vercel (tu link público)

1. Ve a: **https://vercel.com**
2. Haz clic en **"Sign Up"** → **"Continue with Google"**
3. Una vez dentro, haz clic en **"Add New Project"**
4. Haz clic en **"Import"** → luego en **"Browse"** o arrastra la carpeta `amway-firmas`

   *(Si pide conectar GitHub, usa la opción de subir carpeta directamente)*

5. Deja todo como está → haz clic en **"Deploy"**
6. Espera 2-3 minutos mientras Vercel construye tu app
7. Cuando termine, verás una pantalla verde con tu link:
   **`https://amway-firmas-xxxx.vercel.app`**

---

## PASO 4 — Compartir el link

Envía ese link por WhatsApp a cada firmante con este mensaje:

---
*"Hola! Te comparto el enlace para firmar la carta de autorización a Amway LATAM. Solo escribe tu nombre o IBO para encontrarte y firmar. El proceso toma menos de 1 minuto: [TU LINK]*

*Contraseña Admin (solo para ti): Dimito26*"

---

## PANEL DE ADMINISTRADOR

- Abre tu link
- Haz clic en la pestaña **🔒 Admin**
- Ingresa la contraseña: **Dimito26**
- Ahí verás quién firmó y quién falta
- Puedes exportar la lista en Excel con un clic

---

## ¿ALGO NO FUNCIONA?

Los errores más comunes son:
- **"Firebase not configured"** → Verifica que pegaste el firebaseConfig correctamente en App.js
- **"Permission denied"** → En Firebase, verifica que Firestore esté en "modo de prueba"
- **La app no carga** → Espera 5 minutos y recarga la página

---

*Preparado para: José Dmitri Bautista Mijailov · Mayo 2026*
