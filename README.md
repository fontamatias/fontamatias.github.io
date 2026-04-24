# fontamatias.github.io

Portfolio personal de **Matias Fontana** — Desarrollador Backend Junior.  
Publicado en **[fontamatias.github.io](https://fontamatias.github.io/)** mediante GitHub Pages.

---

## Estructura

```
.
├── index.html            # Página principal (una sola página con scroll)
├── assets/
│   ├── style.css         # Estilos (modo oscuro, responsive)
│   ├── app.js            # Lógica JS: fetch a GitHub API, render de cards
│   └── projects.json     # Lista de repositorios a mostrar
└── README.md
```

---

## Cómo editar la lista de proyectos

Abrí `assets/projects.json` y agregá o quitá objetos con la propiedad `"repo"`:

```json
[
  { "repo": "fontamatias/TP-FINAL-DIPLOMATURA" },
  { "repo": "fontamatias/personas_django" }
]
```

- El orden del array determina el orden de las tarjetas en la página.
- Solo necesitás el nombre completo `usuario/repositorio`; los demás datos (descripción, lenguaje, estrellas, homepage) se obtienen automáticamente desde la **GitHub API** al cargar la página.

---

## Publicación con GitHub Pages

1. Asegurate de que el branch `main` tenga los archivos en la raíz del repo.
2. En GitHub → **Settings → Pages**:
   - **Source**: *Deploy from a branch*
   - **Branch**: `main` / `(root)`
3. Guardá y esperá 1–3 minutos.
4. Tu sitio queda disponible en `https://fontamatias.github.io/`.

> No se requiere ningún build step ni dependencias: es HTML + CSS + JS puro.
