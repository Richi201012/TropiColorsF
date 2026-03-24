# Generador de Facturas PDF - Tropic Colors

## 📋 Explicación del Sistema

### ¿Por qué el diseño previo se ve diferente al descargar?

Esta es una pregunta muy importante. **El diseño previo y el PDF descargado son dos cosas completamente diferentes**:

| Aspecto | Vista Previa (Preview) | PDF Descargado |
|---------|------------------------|----------------|
| **Tecnología** | React + Tailwind CSS (HTML) | jsPDF (generación nativa) |
| **Rendering** | El navegador renderiza HTML/CSS | jsPDF dibuja directamente en PDF |
| **Características** | Limitado por el navegador | Control total del documento |
| **Calidad** | Depende de la pantalla | Alta resolución (300 DPI) |

### Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                    FLUJO DE GENERACIÓN DE FACTURA               │
└─────────────────────────────────────────────────────────────────┘

  ┌──────────────┐    ┌─────────────────┐    ┌─────────────────┐
  │   Datos de   │───▶│   useInvoicePDF │───▶│ generateInvoice │
  │   Firebase   │    │      Hook       │    │      PDF.ts     │
  └──────────────┘    └─────────────────┘    └─────────────────┘
                                                          │
                                                          ▼
                         ┌─────────────────────────────────────────┐
                         │        两种渲染引擎 (Two Render Engines) │
                         └─────────────────────────────────────────┘
                                         │
                    ┌────────────────────┴────────────────────┐
                    │                                           │
                    ▼                                           ▼
        ┌───────────────────────┐               ┌───────────────────────┐
        │   Invoice.tsx (HTML)  │               │  jsPDF (PDF Nativo)   │
        │                       │               │                       │
        │ - Renderizado en      │               │ - Generación directa │
        │   navegador           │               │   de documento PDF   │
        │ - Usa Tailwind CSS    │               │ - Sin dependencias   │
        │ - Interactivo         │               │   del DOM            │
        │ - Preview en pantalla │               │ - Descarga archivo   │
        └───────────────────────┘               └───────────────────────┘
                    │                                           │
                    ▼                                           ▼
        ┌───────────────────────┐               ┌───────────────────────┐
        │   Vista Previa        │               │   Archivo .pdf        │
        │   (Diseño visual)     │               │   (Documento real)    │
        └───────────────────────┘               └───────────────────────┘
```

---

## 🔧 Cómo Funciona

### 1. Componente de Vista Previa (`Invoice.tsx`)

El componente `Invoice.tsx` es un componente de React que renderiza la factura como HTML/CSS usando Tailwind. Este es el que **ves en pantalla** cuando navegar por la aplicación.

**Características:**
- Diseño responsive usando Tailwind CSS
- Iconos de Lucide React
- Renderizado en tiempo real en el navegador
- Impresión directa con `window.print()`

```tsx
// Ejemplo de uso del componente de preview
import { Invoice } from '../components/Invoice';

<Invoice 
  data={invoiceData}
  showActions={true}
  onDownloadPDF={() => generarPDF(data)}
  onSendEmail={() => enviarPorEmail(data)}
/>
```

### 2. Generador de PDF (`generateInvoicePDF.ts`)

El archivo `generateInvoicePDF.ts` usa la librería **jsPDF** para generar un documento PDF real desde cero, sin depender del HTML del componente de preview.

**Características:**
- Genera PDF 100% nativo
- No usa html2canvas ni html2pdf
- Diseño profesional con colores corporativos
- Métodos de pago dinámicos desde Firebase
- Formato A4 estándar

```typescript
import { generarFacturaPDF, descargarFacturaPDF } from '../lib/generateInvoicePDF';

// Generar y descargar directamente
descargarFacturaPDF(invoiceData);

// O generar y obtener el objeto jsPDF
const pdf = generarFacturaPDF(invoiceData);
pdf.save('factura.pdf');
```

### 3. Hook de Integración (`useInvoicePDF.ts`)

El hook `useInvoicePDF` conecta los datos del componente de preview con el generador de PDF:

```typescript
import { useInvoicePDF } from '../hooks/useInvoicePDF';

const { downloadPDF, getPDFBlob, getPDFUrl, generatePDF } = useInvoicePDF();

// Descargar PDF
await downloadPDF(data);

// Obtener blob para email
const blob = await getPDFBlob(data);

// Obtener URL para previsualización
const url = await getPDFUrl(data);
```

---

## 📦 Estructura de Datos

### Formato del Componente de Vista Previa (Invoice.tsx)

```typescript
interface InvoiceData {
  invoiceNumber: string;        // Número de factura
  invoiceNumberFormatted?: string; // Formato visual
  issueDate: string;            // Fecha de emisión
  dueDate?: string;             // Fecha de vencimiento
  paymentMethod: 'efectivo' | 'transferencia' | 'tarjeta' | 'mercadopago' | 'oxxo' | 'other';
  status: 'paid' | 'pending' | 'cancelled' | 'overdue';
  company: CompanyInfo;         // Datos de Tropic Colors
  customer: Customer;           // Datos del cliente
  items: InvoiceItem[];         // Productos
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discount?: number;
  total: number;
  notes?: string;
  terms?: string;
  orderId?: string;
}
```

### Formato del Generador de PDF (generateInvoicePDF.ts)

```typescript
interface InvoiceDataPDF {
  folio: string;                 // Folio de factura
  fecha: string;                // Fecha
  metodoPago: string;          // Método de pago (dinámico)
  pedidoId?: string;           // ID del pedido
  company: CompanyInfo;
  cliente: CustomerInfo;
  items: InvoiceItemPDF[];
  subtotal: number;
  total: number;
}
```

---

## 🚀 Cómo Implementar

### Paso 1: Instalar dependencias

确保 tienes instalado jsPDF:

```bash
cd artifacts/tropicolors
pnpm add jspdf
```

### Paso 2: Usar el hook en tu componente

```tsx
import { useInvoicePDF } from '../hooks/useInvoicePDF';

function MiComponente() {
  const { downloadPDF } = useInvoicePDF();

  const handleDownload = async () => {
    // Los datos se transforman automáticamente si es necesario
    await downloadPDF(facturaData);
  };

  return (
    <button onClick={handleDownload}>
      Descargar PDF
    </button>
  );
}
```

### Paso 3: Personalizar el diseño del PDF

Edita el archivo `generateInvoicePDF.ts` para cambiar:

- **Colores**: Modifica el objeto `COLORS`
- **Fuentes**: Usa `pdf.setFont()` con diferentes fuentes
- **Layout**: Ajusta las posiciones `y` y margins
- **Logo**: Agrega tu logo con `pdf.addImage()`

```typescript
// Ejemplo: Cambiar color primario
const COLORS = {
  primary: [26, 35, 126] as [number, number, number],  // Cambia aquí
  // ...
};
```

---

## 📝 Métodos de Pago Soportados

El generador de PDF soporta los siguientes métodos de pago (definidos dinámicamente desde Firebase):

| Clave en Firebase | Etiqueta en PDF |
|-------------------|------------------|
| `efectivo` | Efectivo |
| `transferencia` | Transferencia Bancaria |
| `transferencia_` | Transferencia Bancaria |
| `tarjeta` | Tarjeta de Crédito/Débito |
| `tarjeta_` | Tarjeta de Crédito/Débito |
| `mercadopago` | MercadoPago |
| `oxxo` | Pago en OXXO |
| `paypal` | PayPal |
| `other` | Otro |

---

## ⚠️ Importante: Diferencias Esperadas

**Es normal y esperado** que el diseño visual (preview) sea diferente al PDF descargado porque:

1. **Tecnologías diferentes**: 
   - Preview = HTML + CSS (navegador)
   - PDF = jsPDF (generación nativa)

2. **Propósito diferente**:
   - Preview = Para ver en pantalla e imprimir desde el navegador
   - PDF = Documento profesional para archivo y envío

3. **El PDF downloaded es de mayor calidad** porque:
   - Generación directa sin pérdida de calidad
   - Fuentes vectoriales
   - Diseño optimizado para impresión

---

## 📁 Archivos Clave

```
artifacts/tropicolors/src/
├── components/
│   └── Invoice.tsx          # Componente de vista previa (HTML)
├── hooks/
│   └── useInvoicePDF.ts     # Hook para generar PDFs
├── lib/
│   └── generateInvoicePDF.ts # Generador nativo de PDF
└── types/
    └── invoice.ts           # Definiciones de tipos
```

---

## 🔧 Solución de Problemas

### El PDF se ve diferente al preview
✅ **Esto es correcto**. Son dos sistemas diferentes. El PDF descargado es el documento real.

### Los datos no aparecen en el PDF
1. Verifica que los datos tengan la estructura correcta
2. El hook transforma automáticamente datos legacy si es necesario
3. Revisa la consola para ver errores

### El método de pago no aparece correctamente
1. Verifica que el valor en Firebase sea una de las claves soportadas
2. El sistema automáticamente muestra el valor original si no encuentra coincidencia