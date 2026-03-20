# TropiColors - Sistema de E-commerce

<p align="center">
  <img src="artifacts/tropicolors/public/logo-tropicolors.png" alt="TropicColors Logo" width="200"/>
</p>

> Tienda en línea para la venta de colorantes alimentarios artesanales con envío a todo México.

---

## 📋 Descripción

**TropicColors** es un sistema de comercio electrónico completo desarrollado para una tienda de colorantes alimentarios artesanales. El sistema permite a los clientes explorar productos, agregarlos al carrito, realizar pagos en línea y gestionar pedidos desde un panel administrativo.

### ✨ Características Principales

- 🛍️ **Catálogo de Productos**: Visualización de colorantes en polvo con múltiples presentaciones (25g, 100g, 500g, 1kg, 5kg)
- 🛒 **Carrito de Compras**: Sistema de carrito persistente con gestión de cantidades
- 💳 **Pagos en Línea**: Integración con Stripe para procesamiento de pagos seguros
- 📱 **WhatsApp**: Botón flotante para contacto directo vía WhatsApp
- 📊 **Panel Administrativo**: Dashboard para gestión de pedidos, estadísticas y facturas
- 🎨 **Diseño Responsivo**: Interfaz adaptada para móviles y escritorio

---

## 🏗️ Arquitectura del Sistema

El proyecto utiliza una arquitectura de **monorepo** con múltiples artefactos:

```
TropicColors/
├── artifacts/
│   ├── tropicolors/      # Frontend principal (React + Vite)
│   ├── api-server/       # Backend API (Express + TypeScript)
│   └── mockup-sandbox/   # Entorno de pruebas de componentes
├── package.json          # Configuración del workspace
└── pnpm-workspace.yaml   # Configuración de pnpm
```

### Tecnologías Utilizadas

| Capa | Tecnología |
|------|------------|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS |
| **UI Components** | Radix UI, Shadcn UI, Lucide Icons |
| **Backend** | Express.js, TypeScript, Drizzle ORM |
| **Base de Datos** | PostgreSQL (via Drizzle) |
| **Pagos** | Stripe |
| **Estado** | React Context + React Query |
| **Enrutamiento** | Wouter |
| **Paquetes** | pnpm |

---

## 🚀 Instalación y Configuración

### Prerrequisitos

- **Node.js** 18.x o superior
- **pnpm** 8.x o superior (el proyecto está configurado para usar pnpm)
- **PostgreSQL** (para el backend en producción)

### Pasos de Instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/Richi201012/TropiColorsF.git
   cd TropiColorsF
   ```

2. **Instalar dependencias**
   ```bash
   pnpm install
   ```

3. **Configurar variables de entorno**

   Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

   ```env
   # Base de datos
   DATABASE_URL=postgresql://usuario:password@localhost:5432/tropicolors

   # Stripe (Pagos)
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PUBLISHABLE_KEY=pk_test_...

   # Configuración del servidor
   PORT=3000
   BASE_URL=http://localhost:3000
   ```

4. **Ejecutar el proyecto**

   Para desarrollo (ambos servicios):
   ```bash
   # Terminal 1 - API Server
   cd artifacts/api-server
   pnpm dev

   # Terminal 2 - Frontend
   cd artifacts/tropicolors
   pnpm dev
   ```

5. **Acceder a la aplicación**

   - **Tienda**: http://localhost:5173
   - **API**: http://localhost:3000
   - **Admin**: http://localhost:5173/login (contraseña: `tropicolors2024`)

---

## 📁 Estructura del Proyecto

```
TropicColorsF/
├── artifacts/
│   ├── tropicolors/                    # Frontend principal
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── ui/                 # Componentes de UI (shadcn)
│   │   │   │   ├── CartDrawer.tsx      # Carrito lateral
│   │   │   │   ├── Footer.tsx          # Pie de página
│   │   │   │   ├── Navbar.tsx          # Navegación principal
│   │   │   │   └── FloatingWhatsApp.tsx # Botón flotante WhatsApp
│   │   │   ├── context/
│   │   │   │   └── CartContext.tsx     # Estado global del carrito
│   │   │   ├── pages/
│   │   │   │   ├── Home.tsx            # Página principal
│   │   │   │   └── Admin.tsx           # Panel de administración
│   │   │   ├── App.tsx                 # Componente raíz
│   │   │   └── main.tsx                # Punto de entrada
│   │   ├── public/
│   │   │   └── images/                 # Imágenes del producto
│   │   ├── package.json
│   │   └── vite.config.ts
│   │
│   ├── api-server/                     # Backend API
│   │   ├── src/
│   │   │   ├── routes/
│   │   │   │   ├── products.ts        # Endpoints de productos
│   │   │   │   ├── orders.ts           # Endpoints de pedidos
│   │   │   │   ├── invoices.ts         # Endpoints de facturas
│   │   │   │   ├── contact.ts          # Endpoint de contacto
│   │   │   │   └── admin.ts            # Endpoints admin
│   │   │   ├── app.ts                  # Configuración de Express
│   │   │   └── index.ts                # Punto de entrada
│   │   └── package.json
│   │
│   └── mockup-sandbox/                 # Pruebas de componentes
│
├── package.json                        # Workspace raíz
├── pnpm-workspace.yaml                 # Configuración de workspaces
└── tsconfig.base.json                 # Configuración base de TypeScript
```

---

## 🔌 API Endpoints

### Productos
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/products` | Obtener todos los productos |
| GET | `/api/products/:id` | Obtener un producto específico |

### Pedidos
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/orders/checkout` | Crear sesión de pago con Stripe |
| GET | `/api/orders` | Listar todos los pedidos |
| GET | `/api/orders/:id` | Obtener detalles de un pedido |
| PATCH | `/api/orders/:id/status` | Actualizar estado del pedido |

### Contacto
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/contact` | Enviar mensaje de contacto |

---

## 🔧 Configuración de Producción

### Variables de Entorno Requeridas

```env
# Obligatorias
DATABASE_URL=postgresql://...
STRIPE_SECRET_KEY=sk_live_...

# Opcionales (tienen valores por defecto)
PORT=3000
BASE_URL=https://tudominio.com
```

### Despliegue

1. **Backend**: Configura el API en un servicio como Railway, Render, o VPS
2. **Frontend**: Ejecuta `pnpm build` y despliega la carpeta `dist` en Vercel, Netlify, o cualquier hosting estático
3. **Base de Datos**: Usa PostgreSQL (Supabase, Railway, Neon)

---

## 🛠️ Desarrollo

### Scripts Disponibles

```bash
# Raíz del proyecto
pnpm build          # Compilar todos los artefactos
pnpm typecheck      # Verificar tipos TypeScript

# Frontend
cd artifacts/tropicolors
pnpm dev            # Desarrollo
pnpm build          # Producción
pnpm typecheck      # Verificar tipos

# Backend
cd artifacts/api-server
pnpm dev            # Desarrollo
pnpm build          # Compilar
```

### Contraseña de Administrador

La contraseña por defecto para el panel administrativo es: `tropicolors2024`

> ⚠️ **Nota de Seguridad**: En producción, cambia esta contraseña y considera implementar un sistema de autenticación más robusto.

---

## 📱 Funcionalidades del Frontend

### Página Principal (Home)
- Hero banner con imagen de marca
- Catálogo de productos con filtros por categoría
- Carrusel de productos destacados
- Información de la empresa
- Footer con información de contacto

### Carrito de Compras
- Agregar/eliminar productos
- Seleccionar presentación (peso)
- Actualizar cantidades
- Persistencia del estado

### Proceso de Checkout
- Formulario de datos del cliente
- Dirección de envío
- Integración con Stripe Checkout
- Confirmación de pedido por email

### Panel Administrativo
- **Resumen**: Estadísticas generales de ventas
- **Pedidos**: Lista de pedidos con estados (pendiente → pagado → enviado → entregado)
- **Facturas**: Generación de facturas PDF

---

## 📄 Licencia

Este proyecto es propiedad de TropiColors. Todos los derechos reservados.

---

## 📞 Contacto

- **WhatsApp**: [Enviar mensaje](https://wa.me/52XXXXXXXXXX)
- **Email**: contacto@tropicolors.com
- **Sitio Web**: https://tropicolors.com

---

<p align="center">
  <strong>TropicColors</strong> - Colorantes Alimentarios Artesanales
</p>
