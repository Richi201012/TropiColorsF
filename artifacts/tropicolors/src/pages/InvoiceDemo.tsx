import { Invoice } from '../components/Invoice';
import { buildInvoiceNumber, type InvoiceData } from '../types/invoice';
import { TROPICOLORS_COMPANY_INFO } from '@/lib/company-info';

// Datos de ejemplo para la factura
const sampleInvoiceData: InvoiceData = {
  invoiceNumber: buildInvoiceNumber(1, '2026-03-23'),
  invoiceNumberFormatted: buildInvoiceNumber(1, '2026-03-23'),
  issueDate: '2026-03-23',
  dueDate: '2026-04-23',
  paymentMethod: 'transferencia',
  status: 'pending',
  company: TROPICOLORS_COMPANY_INFO,
  customer: {
    name: 'Juan Pérez García',
    email: 'juan.perez@email.com',
    phone: '+52 55 9876 5432',
    address: 'Calle Flores 456, Col. Jardines, México City',
    city: 'Ciudad de México',
    state: 'CDMX',
    postalCode: '06400',
    rfc: 'PEGJ890101ABC',
  },
  items: [
    {
      id: '1',
      name: 'Camiseta Tropical - Diseño Floral',
      description: 'Talla M, Color Azul Marino',
      quantity: 2,
      unitPrice: 450.00,
      subtotal: 900.00,
    },
    {
      id: '2',
      name: 'Shorts de Playa - wave',
      description: 'Talla L, Color Blanco',
      quantity: 1,
      unitPrice: 380.00,
      subtotal: 380.00,
    },
    {
      id: '3',
      name: 'Sombrero de Paja Tropical',
      description: 'Unitalla',
      quantity: 1,
      unitPrice: 250.00,
      subtotal: 250.00,
    },
    {
      id: '4',
      name: 'Bolsa de Playa - Logo Tropic Colors',
      description: 'Color Natural',
      quantity: 2,
      unitPrice: 180.00,
      subtotal: 360.00,
    },
  ],
  subtotal: 1890.00,
  taxRate: 0.16,
  taxAmount: 302.40,
  discount: 0,
  total: 2192.40,
  notes: 'Los productos tienen garantía de 30 días. El envío se realiza en 3-5 días hábiles.',
  terms: 'El pago debe realizarse dentro de los 30 días posteriores a la emisión de la factura. No se aceptan devoluciones de productos personalizados.',
  orderId: 'PED-2026-0142',
};

// Componente Demo
export const InvoiceDemo: React.FC = () => {
  const handleSendEmail = () => {
    // Implementar lógica de envío de email
    console.log('Enviando factura por email...');
    alert('Factura enviada por email (demo)');
  };

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#1A237E] mb-2">
            Vista Previa de Factura
          </h1>
          <p className="text-slate-600">
            Componente de factura profesional para Tropic Colors
          </p>
        </div>

        {/* Invoice Component */}
        <Invoice 
          data={sampleInvoiceData}
          onSendEmail={handleSendEmail}
        />

        {/* Info Section */}
        <div className="mt-8 p-6 bg-white rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold text-[#1A237E] mb-4">
            Características del Componente
          </h2>
          <ul className="space-y-2 text-slate-600">
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-[#EA580C] rounded-full"></span>
              Diseño profesional con branding de Tropic Colors
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-[#EA580C] rounded-full"></span>
              Datos dinámicos: cliente, productos, total
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-[#EA580C] rounded-full"></span>
              Exportación a PDF con jsPDF
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-[#EA580C] rounded-full"></span>
              Estados: Pagada (verde), Pendiente (amarillo), Cancelada (rojo)
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-[#EA580C] rounded-full"></span>
              Compatible con método de pago: efectivo, transferencia, tarjeta, MercadoPago, OXXO
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-[#EA580C] rounded-full"></span>
              Datos fiscales completos: RFC, dirección, teléfono, email
            </li>
          </ul>
        </div>

        {/* Code Example */}
        <div className="mt-6 p-6 bg-slate-900 rounded-xl">
          <h3 className="text-lg font-semibold text-white mb-3">
            Ejemplo de Uso
          </h3>
          <pre className="text-sm text-slate-300 overflow-x-auto">
{`import { Invoice } from '../components/Invoice';
import type { InvoiceData } from '../types/invoice';

const invoiceData: InvoiceData = {
  invoiceNumber: buildInvoiceNumber(1, '2026-03-23'),
  issueDate: '2026-03-23',
  paymentMethod: 'transferencia',
  status: 'pending',
  company: {
    name: 'Tropicolors',
    address: 'Calle Abedules Mz. 1 Lt. 36, Col. Ejercito del Trabajo II...',
    phone: '55 5114 6856',
    email: 'm_tropicolors1@hotmail.com',
    rfc: 'VAVE840727NKA',
  },
  customer: {
    name: 'Juan Pérez García',
    email: 'juan.perez@email.com',
    phone: '+52 55 9876 5432',
    address: 'Calle Flores 456...',
    city: 'Ciudad de México',
    state: 'CDMX',
    rfc: 'PEGJ890101ABC',
  },
  items: [
    {
      id: '1',
      name: 'Camiseta Tropical',
      quantity: 2,
      unitPrice: 450.00,
      subtotal: 900.00,
    },
    // más productos...
  ],
  subtotal: 1890.00,
  taxRate: 0.16,
  taxAmount: 302.40,
  total: 2192.40,
  notes: 'Garantía de 30 días',
  orderId: 'PED-2026-0142',
};

// Render
<Invoice 
  data={invoiceData}
  onSendEmail={() => console.log('Send email')}
/>`}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDemo;
