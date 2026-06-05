# SPA Laser Manacor

Sitio web estático de la clínica de depilación láser y estética **SPA Laser Manacor** (Mallorca).

## Estructura

```
.
├── index.html        # Página principal (Inicio)
├── servicios.html    # Servicios
├── galeria.html      # Galería
├── sobre.html        # Sobre nosotros
├── contacto.html     # Contacto
├── css/style.css     # Estilos
├── js/main.js        # Interactividad y animaciones
└── assets/
    ├── images/       # Imágenes (.webp)
    ├── logo/         # Logotipos (.svg)
    └── videos/       # Vídeo del hero (.mp4)
```

## Despliegue en Cloudflare Pages

Sitio 100% estático — sin proceso de build.

1. En el panel de Cloudflare ve a **Workers & Pages → Create → Pages → Connect to Git**.
2. Selecciona este repositorio (`spa-laser-manacor`).
3. Configuración de build:
   - **Framework preset:** `None`
   - **Build command:** *(vacío)*
   - **Build output directory:** `/`
4. Guarda y despliega. Cada `push` a la rama principal genera un nuevo despliegue automático.
