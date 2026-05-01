# 🎬 CinemaFrame

<div align="center">

![CinemaFrame Banner](https://img.shields.io/badge/CinemaFrame-Editor%20de%20Fotogramas-e8325a?style=for-the-badge&logo=film&logoColor=white)
![Version](https://img.shields.io/badge/versión-2.0.0-d4a843?style=for-the-badge)
![License](https://img.shields.io/badge/licencia-Propietaria-111116?style=for-the-badge)

**Aplicación web para explorar, subir y editar fotogramas de películas directamente en el navegador.**
Sin instalaciones. Sin plugins. 100% en el cliente.

---

*© 2025 Octavio Sebastian Tabbia & Giovanna Ratti — Todos los derechos reservados.*

</div>

---

## 📋 Índice

- [Descripción](#-descripción)
- [Funcionalidades](#-funcionalidades)
- [Tecnologías](#-tecnologías)
- [Estructura del proyecto](#-estructura-del-proyecto)
- [Instalación y uso](#-instalación-y-uso)
- [Configuración de Supabase](#-configuración-de-supabase)
- [Derechos de autor y licencia](#️-derechos-de-autor-y-licencia)

---

## 📽 Descripción

**CinemaFrame** es una aplicación web semi-profesional desarrollada con React que permite:

- Explorar un catálogo de películas con búsqueda y filtros por categoría.
- Subir nuevas películas al catálogo público mediante Supabase Storage.
- Extraer fotogramas (frames) de cualquier video directamente en el navegador usando Canvas API.
- Editar cada fotograma con herramientas de dibujo, texto y filtros.
- Descargar los fotogramas editados como imágenes JPEG.

Todo el procesamiento ocurre en el navegador del usuario — no se envía ningún video a servidores para su análisis.

---

## ✨ Funcionalidades

### 🏠 Catálogo principal
- Grid de películas con poster, categoría, año y director
- Barra de búsqueda en tiempo real (título, director, descripción)
- Filtros por categoría: Animación, Acción, Drama, Comedia, Terror, Ciencia ficción, Documental, Infantil
- Película demo precargada: *La Princesa y el Sapo*

### 📤 Subida de películas

Formulario multi-step que solicita:

| Campo | Descripción |
|---|---|
| Archivo de video | MP4, WebM, OGG, MKV, MOV |
| Título | Nombre de la película |
| Categoría | Género principal |
| Año de estreno | Año de lanzamiento |
| Director/a | Nombre del director |
| Idioma | Idioma del audio |
| Duración | Duración estimada |
| Descripción | Sinopsis breve |
| Imagen de portada | JPG, PNG o WebP (opcional) |

### ✏️ Editor de fotogramas

| Herramienta | Descripción |
|---|---|
| 🖊 Dibujo libre | Pincel con color y grosor configurables |
| 🧹 Borrador | Borra trazos sobre la imagen |
| 🔤 Texto | Inserción de texto con fuente y color |
| 🎨 Escala de grises | Filtro de grises con intensidad |
| 🎨 Sépia | Efecto sépia clásico |
| 🎨 Invertir | Inversión de colores |
| 🎨 Brillo | Control de luminosidad con slider |
| ↩ Deshacer | Historial de hasta 30 pasos |
| 💾 Guardar | Actualiza el frame en el catálogo local |
| 📥 Descargar | Exporta el frame como JPEG |

### 📱 Diseño responsive
- Totalmente funcional en celulares, tablets y escritorio
- Soporte para dibujo táctil en el editor de frames
- Compatibilidad con notch / Dynamic Island en iPhone

---

## 🛠 Tecnologías

| Tecnología | Uso |
|---|---|
| **React 18** | UI declarativa con hooks |
| **Vite 6** | Bundler y servidor de desarrollo |
| **Canvas API** | Captura y edición de fotogramas |
| **File API** | Carga de archivos de video locales |
| **Supabase** | Base de datos y almacenamiento en la nube |
| **CSS Custom** | Sistema de diseño propio sin librerías de UI |
| **Web APIs** | `<video>`, `seeked`, `toDataURL`, `localStorage` |

**Sin librerías de UI** — el sistema de diseño completo (tema cinematográfico oscuro) está escrito a mano en `index.css`.

---

## 🗂 Estructura del proyecto

```
cinemaframe/
├── public/
│   └── la-princesa-y-el-sapo.mp4      ← Película demo
│
├── src/
│   ├── App.jsx                         ← Router principal (3 vistas)
│   ├── main.jsx                        ← Entry point de React
│   ├── index.css                       ← Sistema de diseño completo
│   │
│   ├── lib/
│   │   └── supabase.js                 ← Cliente Supabase
│   │
│   ├── hooks/
│   │   ├── useMovies.js                ← Fetch, búsqueda y subida de películas
│   │   └── useVideoFrames.js           ← Estado y lógica de extracción de frames
│   │
│   ├── utils/
│   │   └── frameUtils.js               ← Funciones puras de canvas
│   │
│   └── components/
│       ├── Navbar.jsx                  ← Navegación global
│       ├── MovieCard.jsx               ← Tarjeta de película
│       ├── home/
│       │   ├── HomePage.jsx            ← Vista principal del catálogo
│       │   └── CategoryFilter.jsx      ← Chips de filtro por categoría
│       ├── upload/
│       │   └── UploadPage.jsx          ← Formulario multi-step de subida
│       └── editor/
│           ├── EditorPage.jsx          ← Vista del editor
│           ├── VideoPlayer.jsx         ← Carga y reproducción de video
│           ├── FrameExtractor.jsx      ← Configuración y progreso de extracción
│           ├── FrameGrid.jsx           ← Timeline de thumbnails
│           └── FrameEditor.jsx         ← Editor de canvas
│
├── index.html
├── vite.config.js
├── package.json
├── .env.example                        ← Plantilla de variables de entorno
└── README.md
```

---

## 🚀 Instalación y uso

### Requisitos previos
- Node.js 18 o superior
- npm 9 o superior

### Pasos

```bash
# 1. Clonar o descargar el proyecto
cd cinemaframe

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env.local

# 4. Iniciar servidor de desarrollo
npm run dev
# → http://localhost:3000

# 5. Build de producción
npm run build

# 6. Preview del build
npm run preview
```

### Modo demo (sin Supabase)
La app funciona sin configurar Supabase. En ese caso:
- Se muestra la película demo (*La Princesa y el Sapo*)
- El editor de fotogramas funciona completamente
- La subida de nuevas películas al catálogo público estará deshabilitada

---

## ☁️ Configuración de Supabase

Para habilitar el catálogo público y la subida de películas:

### 1. Crear proyecto en [supabase.com](https://supabase.com)

### 2. Ejecutar el siguiente SQL en el SQL Editor

```sql
create table public.movies (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  category    text not null,
  year        int,
  description text,
  director    text,
  language    text,
  duration    text,
  poster_url  text,
  video_url   text not null,
  created_at  timestamptz default now()
);

alter table public.movies enable row level security;
create policy "Public read"   on public.movies for select using (true);
create policy "Public insert" on public.movies for insert with check (true);
```

### 3. Crear dos buckets públicos en Storage
- `movies` → para archivos de video
- `posters` → para imágenes de portada

En ambos: **Public bucket: ON**

### 4. Crear `.env.local` en la raíz del proyecto

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON=tu_clave_anon_publica
```

Las credenciales se encuentran en **Settings → API** dentro del dashboard de Supabase.

---

## ⚖️ Derechos de autor y licencia

```
╔══════════════════════════════════════════════════════════════════════╗
║                                                                      ║
║   CinemaFrame — Editor de Fotogramas de Video                        ║
║                                                                      ║
║   Copyright © 2025                                                   ║
║   Octavio Sebastian Tabbia & Giovanna Ratti                          ║
║   Todos los derechos reservados.                                     ║
║                                                                      ║
║   All rights reserved.                                               ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝
```

### Licencia propietaria — Uso restringido

Este software, incluyendo su código fuente, diseño, estructura, documentación
y todos los archivos asociados, es propiedad exclusiva de
**Octavio Sebastian Tabbia** y **Giovanna Ratti**.

**Queda expresamente prohibido**, sin autorización escrita previa de los titulares:

- ❌ Copiar, reproducir o distribuir este software, total o parcialmente
- ❌ Modificar, adaptar o crear obras derivadas basadas en este código
- ❌ Usar este software con fines comerciales
- ❌ Sublicenciar, vender, alquilar o transferir el software a terceros
- ❌ Eliminar o alterar los avisos de copyright presentes en el código
- ❌ Realizar ingeniería inversa sobre cualquier componente del sistema

### Lo que sí está permitido

- ✅ Usar el software para los fines para los que fue desarrollado
- ✅ Consultar el código fuente con fines de referencia personal
- ✅ Reportar errores o sugerir mejoras a los titulares

### Contacto

Para solicitar permisos, licencias de uso o colaboraciones,
contactar directamente a los titulares de los derechos.

---

### Aviso legal

> Este software se proporciona "tal cual", sin garantías de ningún tipo,
> expresas o implícitas. Los titulares no serán responsables por ningún
> daño directo, indirecto, incidental o consecuente derivado del uso
> o la imposibilidad de uso de este software.
>
> El incumplimiento de esta licencia puede dar lugar a acciones legales
> conforme a la legislación de propiedad intelectual aplicable.

---

<div align="center">

**CinemaFrame** · Desarrollado con ❤️ por Octavio Sebastian Tabbia & Giovanna Ratti

*© 2025 — Todos los derechos reservados / All rights reserved*

</div>