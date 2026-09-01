import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { X, Download, Copy, Check, QrCode, ExternalLink, Sparkles, Utensils } from 'lucide-react';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type QRDestination = 'menu' | 'combos' | 'whatsapp' | 'mesa';

export const QRCodeModal: React.FC<QRCodeModalProps> = ({ isOpen, onClose }) => {
  const [destination, setDestination] = useState<QRDestination>('menu');
  const [tableNumber, setTableNumber] = useState('1');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // Compute targeted URL
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://falcons-alitas.com';

  const getTargetUrl = () => {
    switch (destination) {
      case 'menu':
        return `${currentOrigin}#menu`;
      case 'combos':
        return `${currentOrigin}#cat-combos`;
      case 'mesa':
        return `${currentOrigin}?mesa=${encodeURIComponent(tableNumber)}#menu`;
      case 'whatsapp':
        return `https://wa.me/573193574825?text=${encodeURIComponent('¡Hola Falcon\'s Alitas! Escaneé el código QR y quiero hacer un pedido.')}`;
    }
  };

  const targetUrl = getTargetUrl();

  useEffect(() => {
    if (isOpen) {
      QRCode.toDataURL(targetUrl, {
        width: 320,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        },
        errorCorrectionLevel: 'H'
      })
        .then((url) => {
          setQrDataUrl(url);
        })
        .catch((err) => {
          console.error('Error generating QR Code', err);
        });
    }
  }, [isOpen, destination, tableNumber, targetUrl]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(targetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.download = `QR-Falcons-Alitas-${destination}${destination === 'mesa' ? `-Mesa${tableNumber}` : ''}.png`;
    link.href = qrDataUrl;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4 transform-gpu">
      <div
        id="qr-code-dialog"
        className="bg-[#141414] w-full max-w-md rounded-3xl border border-neutral-800 p-5 sm:p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 max-h-[92dvh] overflow-y-auto hide-scrollbar transform-gpu"
      >
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display text-2xl font-bold text-white uppercase tracking-wider leading-none">
                Código QR Dinámico
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Deep-Linking para mesas y pedidos express
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar modal de QR"
            className="text-neutral-400 hover:text-white p-1.5 rounded-lg bg-neutral-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Destination Selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider block">
            Selecciona el Destino del Código QR:
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setDestination('menu')}
              className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-left flex items-center gap-2 ${
                destination === 'menu'
                  ? 'bg-[#E53E3E] text-white border-[#E53E3E] shadow-md shadow-red-950'
                  : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-neutral-700'
              }`}
            >
              <span>📖</span>
              <span>Menú Digital (#menu)</span>
            </button>

            <button
              onClick={() => setDestination('combos')}
              className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-left flex items-center gap-2 ${
                destination === 'combos'
                  ? 'bg-[#E53E3E] text-white border-[#E53E3E] shadow-md shadow-red-950'
                  : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-neutral-700'
              }`}
            >
              <span>🍗</span>
              <span>Combos & Alitas</span>
            </button>

            <button
              onClick={() => setDestination('mesa')}
              className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-left flex items-center gap-2 ${
                destination === 'mesa'
                  ? 'bg-[#E53E3E] text-white border-[#E53E3E] shadow-md shadow-red-950'
                  : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-neutral-700'
              }`}
            >
              <span>🪑</span>
              <span>Para Mesa en Local</span>
            </button>

            <button
              onClick={() => setDestination('whatsapp')}
              className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-left flex items-center gap-2 ${
                destination === 'whatsapp'
                  ? 'bg-[#E53E3E] text-white border-[#E53E3E] shadow-md shadow-red-950'
                  : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-neutral-700'
              }`}
            >
              <span>💬</span>
              <span>WhatsApp Directo</span>
            </button>
          </div>

          {/* If Mesa is chosen */}
          {destination === 'mesa' && (
            <div className="pt-2 flex items-center gap-2">
              <label className="text-xs text-amber-300 font-semibold shrink-0">
                Número de Mesa:
              </label>
              <input
                type="text"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                placeholder="1"
                className="w-20 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-white text-center font-bold focus:outline-none focus:border-amber-400"
              />
            </div>
          )}
        </div>

        {/* QR Code Presentation Box */}
        <div className="bg-white p-4 rounded-2xl shadow-xl flex flex-col items-center justify-center relative group">
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt="Código QR Falcon's Alitas"
              className="w-48 h-48 sm:w-56 sm:h-56 object-contain"
            />
          ) : (
            <div className="w-48 h-48 sm:w-56 sm:h-56 bg-neutral-100 animate-pulse rounded-xl" />
          )}
          <div className="mt-2 text-center">
            <span className="text-[11px] font-extrabold text-black uppercase tracking-wider block">
              Falcon's Alitas • San Antonio de Prado
            </span>
            <span className="text-[10px] text-neutral-600 truncate max-w-[240px] block mx-auto font-mono">
              {targetUrl}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={handleCopyLink}
            className="bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-800 px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">¡Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-neutral-400" />
                <span>Copiar Enlace</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownloadQR}
            className="bg-gradient-to-r from-[#E53E3E] to-red-700 hover:from-red-600 hover:to-[#E53E3E] text-white px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-red-950"
          >
            <Download className="w-4 h-4" />
            <span>Descargar PNG</span>
          </button>
        </div>
      </div>
    </div>
  );
};
