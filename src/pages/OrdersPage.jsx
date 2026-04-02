import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, CreditCard, XCircle } from 'lucide-react';
import { orderApi, paymentApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { alertError, alertConfirmDelete, toastSuccess } from '../utils/alerts';

function formatPrice(price) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(price);
}

const statusColors = {
  Pending: { bg: 'rgba(234,179,8,0.15)', color: '#eab308' },
  Confirmed: { bg: 'rgba(59,130,246,0.15)', color: '#3b82f6' },
  PaymentPending: { bg: 'rgba(249,115,22,0.15)', color: '#f97316' },
  Paid: { bg: 'rgba(34,197,94,0.15)', color: '#22c55e' },
  Shipped: { bg: 'rgba(139,92,246,0.15)', color: '#8b5cf6' },
  Delivered: { bg: 'rgba(34,197,94,0.15)', color: '#22c55e' },
  Cancelled: { bg: 'rgba(239,68,68,0.15)', color: '#ef4444' },
  Refunded: { bg: 'rgba(107,114,128,0.15)', color: '#6b7280' },
};

const statusLabels = {
  Pending: 'Pendiente',
  Confirmed: 'Confirmada',
  PaymentPending: 'Pago Pendiente',
  Paid: 'Pagada',
  Shipped: 'Enviada',
  Delivered: 'Entregada',
  Cancelled: 'Cancelada',
  Refunded: 'Reembolsada',
};

const paymentMethods = [
  { value: 'PSE', label: 'PSE' },
  { value: 'CreditCard', label: 'Tarjeta de Credito' },
  { value: 'DebitCard', label: 'Tarjeta Debito' },
  { value: 'Nequi', label: 'Nequi' },
  { value: 'Daviplata', label: 'Daviplata' },
  { value: 'BankTransfer', label: 'Transferencia Bancaria' },
];

export default function OrdersPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingOrder, setPayingOrder] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState('PSE');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!user) { navigate('/'); return; }
    loadOrders();
  }, [user, navigate]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await orderApi.getMyOrders();
      setOrders(res.data || []);
    } catch { /* ignore */ }
    setLoading(false);
  };

  const handlePay = async () => {
    if (!payingOrder) return;
    setProcessing(true);
    try {
      const initRes = await paymentApi.initiate({ orderId: payingOrder.id, method: selectedMethod });
      if (initRes.success && initRes.data?.transactionId) {
        // Simulate payment confirmation (in production, this would be a redirect to payment gateway)
        const confirmRes = await paymentApi.confirm({ transactionId: initRes.data.transactionId });
        if (confirmRes.success) {
          toastSuccess('Pago realizado exitosamente');
          setPayingOrder(null);
          loadOrders();
        }
      }
    } catch (err) {
      alertError('Error', err.message || 'Error al procesar el pago');
    }
    setProcessing(false);
  };

  const handleCancel = async (order) => {
    const result = await alertConfirmDelete('Cancelar orden', `Cancelar orden de "${order.productName}"?`);
    if (!result.isConfirmed) return;
    try {
      await orderApi.cancel(order.id);
      loadOrders();
      toastSuccess('Orden cancelada');
    } catch (err) {
      alertError('Error', err.message);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-6" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-4xl mx-auto">
        <h1 className="font-display text-3xl font-bold mb-8" style={{ color: 'var(--text-primary)' }}>Mis Ordenes</h1>

        {loading ? (
          <div className="text-center py-20">
            <div className="w-10 h-10 border-3 border-t-transparent rounded-full animate-spin mx-auto" style={{ borderColor: 'var(--gold)', borderTopColor: 'transparent' }} />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 rounded-2xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
            <ShoppingBag size={48} className="mx-auto mb-4 opacity-30" style={{ color: 'var(--text-muted)' }} />
            <p className="font-display text-lg" style={{ color: 'var(--text-muted)' }}>No tienes ordenes</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const sc = statusColors[order.status] || statusColors.Pending;
              return (
                <div key={order.id} className="rounded-2xl border p-5" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <h3 className="font-display font-bold" style={{ color: 'var(--text-primary)' }}>{order.productName}</h3>
                      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{order.companyName}</p>
                      <span className="inline-block mt-2 text-xs px-3 py-1 rounded-full font-medium" style={{ background: sc.bg, color: sc.color }}>
                        {statusLabels[order.status] || order.status}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold" style={{ color: 'var(--gold)' }}>{formatPrice(order.agreedPrice)}</p>
                      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                        Comision: {formatPrice(order.commissionAmount)} ({order.commissionPercentage}%)
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {new Date(order.createdAt).toLocaleDateString('es-CO')}
                      </p>
                    </div>
                  </div>

                  {(order.status === 'Confirmed' || order.status === 'PaymentPending') && (
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => setPayingOrder(order)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition hover:opacity-90"
                        style={{ background: 'var(--color-gold-bright)', color: '#1a1a1a' }}
                      >
                        <CreditCard size={16} /> Pagar
                      </button>
                      <button
                        onClick={() => handleCancel(order)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-red-400 transition hover:bg-red-500/10"
                      >
                        <XCircle size={16} /> Cancelar
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {payingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }}>
          <div className="w-full max-w-md rounded-2xl p-6 border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
            <h2 className="font-display text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Pagar Orden</h2>
            <div className="mb-4 p-4 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
              <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{payingOrder.productName}</p>
              <p className="text-2xl font-bold mt-1" style={{ color: 'var(--gold)' }}>{formatPrice(payingOrder.agreedPrice)}</p>
            </div>

            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Metodo de pago</label>
            <div className="space-y-2 mb-6">
              {paymentMethods.map((m) => (
                <label key={m.value} className="flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition" style={{
                  borderColor: selectedMethod === m.value ? 'var(--gold)' : 'var(--border)',
                  background: selectedMethod === m.value ? 'rgba(212,164,40,0.08)' : 'transparent',
                }}>
                  <input type="radio" name="method" value={m.value} checked={selectedMethod === m.value} onChange={(e) => setSelectedMethod(e.target.value)} style={{ accentColor: 'var(--gold)' }} />
                  <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{m.label}</span>
                </label>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handlePay}
                disabled={processing}
                className="flex-1 py-3 rounded-xl font-semibold text-sm transition disabled:opacity-50 hover:opacity-90"
                style={{ background: 'var(--color-gold-bright)', color: '#1a1a1a' }}
              >
                {processing ? 'Procesando...' : 'Confirmar Pago'}
              </button>
              <button
                onClick={() => setPayingOrder(null)}
                className="px-4 py-3 rounded-xl text-sm"
                style={{ color: 'var(--text-muted)' }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
