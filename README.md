# Golden Gems

Tienda en línea de joyería con esmeraldas colombianas en oro de 18 kilates.

## Tech Stack

- **Frontend:** React 19 + Vite 6
- **Estilos:** Tailwind CSS 4
- **Routing:** React Router DOM 7
- **Backend proxy:** API en `http://localhost:5233` (proxy via Vite en `/api`)

## Estructura del proyecto

```
src/
├── api/
│   └── client.js              # Cliente HTTP para la API
├── components/
│   ├── auth/
│   │   ├── LoginModal.jsx      # Modal de inicio de sesión
│   │   └── RegisterModal.jsx   # Modal de registro
│   ├── chat/                   # Componentes de chat
│   ├── home/
│   │   ├── Esmeraldas.jsx      # Sección de esmeraldas
│   │   ├── Essence.jsx         # Sección esencia de la marca
│   │   ├── FeaturedProducts.jsx# Productos destacados
│   │   └── Hero.jsx            # Banner principal
│   ├── layout/
│   │   ├── Navbar.jsx          # Barra de navegación
│   │   └── Footer.jsx          # Pie de página
│   └── products/
│       └── ProductCard.jsx     # Tarjeta de producto
├── context/
│   ├── AuthContext.jsx         # Contexto de autenticación
│   └── ThemeContext.jsx        # Contexto de tema (claro/oscuro)
├── hooks/
│   └── useReveal.js            # Hook para animaciones de reveal
├── pages/
│   ├── HomePage.jsx            # Página principal
│   ├── ProductsPage.jsx        # Catálogo de productos
│   ├── ProductDetailPage.jsx   # Detalle de producto
│   └── ChatPage.jsx            # Chat con vendedor
├── App.jsx                     # Rutas y layout principal
├── main.jsx                    # Entry point
└── index.css                   # Estilos globales

public/
├── Logo/
│   └── logo.PNG                # Logo de la empresa
└── Joyas/                      # Imágenes de productos
```

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Build

```bash
npm run build
npm run preview
```

## Funcionalidades

- Catálogo de joyas con esmeraldas colombianas
- Sistema de autenticación (login/registro)
- Chat con vendedor
- Tema claro/oscuro
- Diseño responsivo
- Logo corporativo integrado en Navbar, modales y footer
- Deploy automático con GitHub Actions
