import React, { useState } from 'react';
import { CustomerInfo } from '../types';
import { CheckCircle2, Copy, Check, MessageSquare, X, Flame, Star, ExternalLink } from 'lucide-react';

interface OrderSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderData: {
    summaryText: string;
    total: number;
    customer: CustomerInfo;
  } | null;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({ isOpen, onClose, orderData }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !orderData) return null;

  const formatMoney = (amount: number) => '$' + amount.toLocaleString('es-CO');

  const handleCopy = () => {
    navigator.clipboard.writeText(orderData.summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenWhatsAppAgain = () => {
    const phone = '573193574825';
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(orderData.summaryText)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4 transform-gpu">
      <div
        id="order-success-dialog"
        className="bg-[#141414] w-full max-w-md rounded-3xl border border-neutral-800 p-5 sm:p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 max-h-[92dvh] overflow-y-auto hide-scrollbar transform-gpu"
      >
        {/* Top Success Badge */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-950">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="font-display text-3xl font-bold text-white uppercase tracking-wide">
            ¡Pedido Generado!
          </h3>
          <p className="text-xs text-neutral-300">
            Tu orden está lista para ser despachada por el equipo de Falcon's Alitas.
          </p>
        </div>

        {/* Order Details Preview Box */}
        <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 text-xs space-y-2 text-neutral-300 font-mono">
          <div className="flex justify-between border-b border-neutral-800 pb-2">
            <span className="text-neutral-400">Cliente:</span>
            <span className="text-white font-bold">{orderData.customer.name}</span>
          </div>
          <div className="flex justify-between border-b border-neutral-800 pb-2">
            <span className="text-neutral-400">Modalidad:</span>
            <span className="text-white font-bold uppercase">{orderData.customer.orderType}</span>
          </div>
          <div className="flex justify-between border-b border-neutral-800 pb-2">
            <span className="text-neutral-400">Método de Pago:</span>
            <span className="text-amber-400 font-bold">{orderData.customer.paymentMethod}</span>
          </div>
          <div className="flex justify-between pt-1 text-sm font-bold">
            <span className="text-white">Total:</span>
            <span className="text-amber-400 font-display text-xl">{formatMoney(orderData.total)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2 pt-1">
          <button
            onClick={handleOpenWhatsAppAgain}
            className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white py-3.5 rounded-2xl font-extrabold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-950"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Abrir WhatsApp Nuevamente</span>
          </button>

          {/* Direct Google Review Button */}
          <a
            href="https://search.google.com/local/writereview?placeid=ChIJNfenHViBRo4RkHjghosd4M0"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md shadow-amber-950/40 active:scale-95"
          >
            <Star className="w-4 h-4 fill-black text-black" />
            <span>⭐ Calificar Falcon's 5★ en Google Maps</span>
          </a>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleCopy}
              className="bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-800 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-neutral-400" />}
              <span>{copied ? '¡Copiado!' : 'Copiar Texto'}</span>
            </button>

            <button
              onClick={onClose}
              className="bg-neutral-800 hover:bg-neutral-700 text-white py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
