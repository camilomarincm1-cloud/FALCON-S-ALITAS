import React, { useState } from 'react';
import { X, MapPin, Clock, Phone, CreditCard, Star, ExternalLink, ShieldCheck, Copy, Check } from 'lucide-react';

interface StoreInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StoreInfoModal: React.FC<StoreInfoModalProps> = ({ isOpen, onClose }) => {
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAccount(label);
    setTimeout(() => setCopiedAccount(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4 transform-gpu">
      <div
        id="store-info-dialog"
        className="bg-[#141414] w-full max-w-lg rounded-3xl border border-neutral-800 p-5 sm:p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 max-h-[90dvh] overflow-y-auto hide-scrollbar transform-gpu"
      >
        {/* Header */}
        <div className="flex justify-between items-start border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#E53E3E] via-[#D69E2E] to-yellow-400 flex items-center justify-center font-display font-bold text-2xl text-black shadow-lg shadow-red-600/30">
              FA
            </div>
            <div>
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-white uppercase tracking-wider leading-none">
                Falcon's Alitas
              </h3>
              <p className="text-xs text-amber-400 font-semibold mt-0.5">
                Sabor Artesanal • San Antonio de Prado
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar información"
            className="text-neutral-400 hover:text-white p-1.5 rounded-lg bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Location & Schedule */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-neutral-900/60 p-3.5 rounded-2xl border border-neutral-800 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-extrabold text-white uppercase tracking-wider">
              <MapPin className="w-4 h-4 text-red-500" />
              <span>Ubicación</span>
            </div>
            <p className="text-xs text-neutral-300">
              Calle 48D Sur N. 55C - 04
            </p>
            <p className="text-[11px] text-neutral-400">
              San Antonio de Prado, Medellín, Antioquia
            </p>
            <a
              href="https://search.google.com/local/writereview?placeid=ChIJNfenHViBRo4RkHjghosd4M0"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 hover:underline pt-1"
            >
              <span>Ver y Calificar en Google Maps</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="bg-neutral-900/60 p-3.5 rounded-2xl border border-neutral-800 space-y-2">
            <div className="flex items-center gap-2 text-xs font-extrabold text-white uppercase tracking-wider">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>Horarios de Atención</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-800/80">
                <span className="text-[11px] font-bold text-white block">🏪 Punto Físico (En Mesa / Llevar)</span>
                <span className="text-xs text-emerald-400 font-extrabold">3:00 PM – 11:00 PM</span>
              </div>
              <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-800/80">
                <span className="text-[11px] font-bold text-white block">🛵 Despacho de Domicilios</span>
                <span className="text-xs text-amber-300 font-extrabold">5:00 PM – 10:30 PM</span>
              </div>
            </div>
            <p className="text-[10px] text-neutral-400 pt-0.5">
              Atención todos los días en San Antonio de Prado.
            </p>
          </div>
        </div>

        {/* Payment Accounts Box */}
        <div className="bg-neutral-900/80 p-4 rounded-2xl border border-neutral-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-extrabold text-amber-400 uppercase tracking-wider">
              <CreditCard className="w-4 h-4 text-amber-400" />
              <span>Cuentas para Transferencias</span>
            </div>
            <span className="text-[10px] text-neutral-400 font-mono">Falcon's Oficial</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Nequi */}
            <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold text-purple-400 uppercase block">Nequi</span>
                <span className="text-xs font-mono font-bold text-white">609 4453 0676</span>
              </div>
              <button
                onClick={() => handleCopy('60944530676', 'nequi')}
                className="bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[11px] font-bold px-2 py-1 rounded-lg transition-all"
              >
                {copiedAccount === 'nequi' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-neutral-400" />
                )}
              </button>
            </div>

            {/* Bancolombia */}
            <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase block">Bancolombia</span>
                <span className="text-xs font-mono font-bold text-white">609 4453 0676</span>
              </div>
              <button
                onClick={() => handleCopy('60944530676', 'bancolombia')}
                className="bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[11px] font-bold px-2 py-1 rounded-lg transition-all"
              >
                {copiedAccount === 'bancolombia' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-neutral-400" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Customer Reviews Spotlight */}
        <div className="bg-neutral-900/40 p-4 rounded-2xl border border-neutral-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-amber-400 font-bold text-xs uppercase">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>Calificación de Clientes (4.6 / 5.0)</span>
            </div>
            <a
              href="https://search.google.com/local/writereview?placeid=ChIJNfenHViBRo4RkHjghosd4M0"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-amber-400 hover:underline font-bold flex items-center gap-1"
            >
              <span>30+ reseñas</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>

          <div className="space-y-2 text-xs">
            <div className="bg-neutral-950/80 p-2.5 rounded-xl border border-neutral-800/60">
              <p className="text-neutral-200 italic">"Las alitas y las papas mechas son de otro nivel en San Antonio de Prado, súper recomendadas y la salsa rosada deliciosa."</p>
              <span className="text-[10px] text-neutral-400 font-semibold block mt-1">— Mateo R.</span>
            </div>
            <div className="bg-neutral-950/80 p-2.5 rounded-xl border border-neutral-800/60">
              <p className="text-neutral-200 italic">"Las hamburguesas artesanales son jugosas y el servicio por WhatsApp es rapidísimo."</p>
              <span className="text-[10px] text-neutral-400 font-semibold block mt-1">— Sandra G.</span>
            </div>
          </div>

          {/* Botón de Calificación Directa */}
          <a
            href="https://search.google.com/local/writereview?placeid=ChIJNfenHViBRo4RkHjghosd4M0"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black py-2.5 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md shadow-amber-950/40 active:scale-95"
          >
            <Star className="w-4 h-4 fill-black text-black" />
            <span>Calificar con 5 Estrellas en Google Maps</span>
          </a>
        </div>

        {/* Direct WhatsApp Call */}
        <a
          href="https://wa.me/573193574825"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-950"
        >
          <Phone className="w-4 h-4" />
          <span>Llamar o Chatear al +57 319 357 4825</span>
        </a>
      </div>
    </div>
  );
};
