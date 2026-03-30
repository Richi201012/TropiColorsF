// Tipos para el componente de Factura

export interface InvoiceItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Customer {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  exteriorNumber?: string;
  interiorNumber?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  rfc?: string;
}

export interface CompanyInfo {
  name: string;
  logo?: string;
  address: string;
  phone: string;
  email: string;
  rfc?: string;
  website?: string;
}

export interface InvoiceData {
  invoiceNumber: string;
  invoiceNumberFormatted?: string;
  issueDate: string;
  dueDate?: string;
  paymentMethod: 'efectivo' | 'transferencia' | 'tarjeta' | 'mercadopago' | 'oxxo' | 'other';
  status: 'paid' | 'pending' | 'cancelled' | 'overdue';
  company: CompanyInfo;
  customer: Customer;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discount?: number;
  total: number;
  notes?: string;
  terms?: string;
  orderId?: string;
}

export interface InvoiceProps {
  data: InvoiceData;
  showActions?: boolean;
  onDownloadPDF?: () => void;
  onSendEmail?: () => void;
  isPreview?: boolean;
}

// Helper para formatear moneda
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(amount);
};

// Helper para formatear fecha
export const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(dateObj);
};

export const formatCustomerAddress = (customer: Customer): string => {
  const addressText = customer.address || "";

  return [
    addressText,
    customer.exteriorNumber && !addressText.includes(`Ext. ${customer.exteriorNumber}`)
      ? `Ext. ${customer.exteriorNumber}`
      : undefined,
    customer.interiorNumber && !addressText.includes(`Int. ${customer.interiorNumber}`)
      ? `Int. ${customer.interiorNumber}`
      : undefined,
    customer.city && !addressText.includes(customer.city)
      ? customer.city
      : undefined,
    customer.state && !addressText.includes(customer.state)
      ? customer.state
      : undefined,
    customer.postalCode && !addressText.includes(customer.postalCode)
      ? `C.P. ${customer.postalCode}`
      : undefined,
  ]
    .filter(Boolean)
    .join(", ");
};

// Helper para generar un folio de factura mÃ¡s profesional
export const buildInvoiceNumber = (
  sequence: number,
  date: string | Date = new Date(),
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const year = Number.isNaN(dateObj.getTime())
    ? new Date().getFullYear()
    : dateObj.getFullYear();

  return `TC-${year}-${String(Math.max(1, sequence)).padStart(5, '0')}`;
};

// Helper para obtener etiqueta de método de pago
export const getPaymentMethodLabel = (method: InvoiceData['paymentMethod']): string => {
  const labels: Record<InvoiceData['paymentMethod'], string> = {
    efectivo: 'Efectivo',
    transferencia: 'Transferencia Bancaria',
    tarjeta: 'Tarjeta de Crédito/Débito',
    mercadopago: 'MercadoPago',
    oxxo: 'OXXO Pay',
    other: 'Otro',
  };
  return labels[method] || method;
};

// Helper para obtener color de estado
export const getStatusColor = (status: InvoiceData['status']): string => {
  const colors: Record<InvoiceData['status'], string> = {
    paid: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    cancelled: 'bg-red-100 text-red-800',
    overdue: 'bg-red-100 text-red-800',
  };
  return colors[status];
};

// Helper para obtener etiqueta de estado
export const getStatusLabel = (status: InvoiceData['status']): string => {
  const labels: Record<InvoiceData['status'], string> = {
    paid: 'Pagada',
    pending: 'Pendiente',
    cancelled: 'Cancelada',
    overdue: 'Vencida',
  };
  return labels[status];
};
