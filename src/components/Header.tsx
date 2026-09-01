import React from 'react';
import { ShoppingBag, QrCode, Phone, MapPin, Clock, Star, Info, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenQR: () => void;
  onOpenInfo: () => void;
  onOpenAdmin?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  cartCount,
  onOpenCart,
  onOpenQR,
  onOpenInfo,
  onOpenAdmin
}) => {
  const headerRef = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    const updateHeight = () => {
      if (headerRef.current) {
        const height = headerRef.current.offsetHeight;
        document.documentElement.style.setProperty('--app-header-height', `${height}px`);
      }
    };
    updateHeight();
    window.addEventListener('resize', updateHeight);
    const observer = new ResizeObserver(updateHeight);
    if (headerRef.current) observer.observe(headerRef.current);
    return () => {
      window.removeEventListener('resize', updateHeight);
      observer.disconnect();
    };
  }, []);

  return (
    <header 
      ref={headerRef}
      id="main-app-header"
      className="sticky top-0 z-30 bg-[#0A0A0A]/85 backdrop-blur-xl border-b border-neutral-800/80 px-3 sm:px-4 pt-[calc(env(safe-area-inset-top,0px)+0.625rem)] pb-2.5 sm:py-3 shadow-2xl transition-all relative overflow-hidden transform-gpu"
    >
      {/* Fondo Transparente con Logo Watermark Artístico */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
        <div className="absolute -right-6 sm:right-16 -top-10 sm:-top-8 w-44 h-44 sm:w-56 sm:h-56 opacity-10 sm:opacity-15 blur-[0.5px] transform rotate-12 transition-all">
          <img 
            src="/logo.png" 
            alt="Falcon's Background Watermark" 
            className="w-full h-full object-contain filter drop-shadow-2xl"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&auto=format&fit=crop&q=80';
            }}
          />
        </div>
        {/* Glow sutil cálido */}
        <div className="absolute right-0 top-0 w-48 h-full bg-gradient-to-l from-amber-500/5 via-red-600/5 to-transparent"></div>
      </div>

      <div className="max-w-4xl mx-auto flex items-center justify-between gap-2.5 sm:gap-4 relative z-10">
        {/* Brand, Badges & Quick Live Status (Clickable -> Opens Business Info Modal) */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1">
          {/* Logo Badge con efecto translúcido */}
          <div 
            className="relative group cursor-pointer shrink-0" 
            onClick={onOpenInfo}
            title="Ver información del local y horarios"
          >
            <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-neutral-900/80 backdrop-blur-md border border-amber-500/40 p-1 flex items-center justify-center shadow-lg shadow-red-950/40 transform group-hover:scale-105 transition-all">
              <img 
                src="/logo.png" 
                alt="Falcon's Logo" 
                className="w-full h-full object-cover rounded-xl opacity-90 group-hover:opacity-100 transition-opacity" 
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&auto=format&fit=crop&q=80';
                }}
              />
            </div>
            <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-black"></span>
            </span>
          </div>

          {/* Información Comercial Reorganizada */}
          <div className="min-w-0 flex-1">
            {/* Titular y Tag de Ubicación */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <h1 
                onClick={onOpenInfo}
                className="font-display text-xl sm:text-2xl font-black tracking-wider leading-none text-white uppercase hover:text-amber-400 transition-colors cursor-pointer whitespace-nowrap"
              >
                Falcon's Alitas
              </h1>
              <span className="bg-gradient-to-r from-red-600/30 to-amber-600/30 text-amber-300 text-[9.5px] sm:text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-amber-500/30 uppercase tracking-wide shrink-0">
                Prado
              </span>
            </div>

            {/* Llamado a la Acción Directo de Calificación */}
            <a 
              href="https://search.google.com/local/writereview?placeid=ChIJNfenHViBRo4RkHjghosd4M0"
              target="_blank"
              rel="noopener noreferrer"
              title="Calificar Falcon's Alitas con 5 Estrellas en Google Maps"
              className="text-[10.5px] sm:text-[11px] text-neutral-300 hover:text-amber-400 flex items-center gap-1.5 mt-0.5 transition-colors truncate font-medium group"
            >
              <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0 group-hover:scale-110 transition-transform" />
              <span className="truncate">¡Pide fácil en 1 minuto y califica tu experiencia 5★!</span>
            </a>

            {/* Badges de Horarios y Domicilios */}
            <div className="flex items-center gap-1.5 sm:gap-2 mt-1 text-[9.5px] sm:text-[10.5px] flex-wrap">
              <span className="inline-flex items-center gap-1 bg-emerald-950/40 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded-md font-semibold">
                <Clock className="w-2.5 h-2.5 text-emerald-400" />
                <span>Local 3PM - 11PM</span>
              </span>
              <span className="inline-flex items-center gap-1 bg-amber-950/40 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded-md font-semibold">
                <span>🛵 Domicilios 5PM - 10:30PM</span>
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls Reorganizados */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Admin CMS Button */}
          {onOpenAdmin && (
            <button
              id="open-admin-cms-header-btn"
              onClick={onOpenAdmin}
              title="Panel de Administración y Precios CMS"
              aria-label="Panel de Administración CMS"
              className="bg-neutral-900/80 hover:bg-neutral-800 text-neutral-400 hover:text-amber-400 p-2 sm:p-2.5 rounded-xl border border-neutral-800 hover:border-amber-400/40 backdrop-blur-md transition-all flex items-center justify-center shadow-md active:scale-95 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400/80" />
            </button>
          )}

          {/* QR Code Deep Link Button */}
          <button
            id="open-qr-modal-btn"
            onClick={onOpenQR}
            title="Generar Código QR del Menú"
            aria-label="Código QR"
            className="bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 hover:text-amber-400 p-2 sm:p-2.5 rounded-xl border border-neutral-800 hover:border-amber-400/40 backdrop-blur-md transition-all flex items-center justify-center shadow-md active:scale-95 cursor-pointer"
          >
            <QrCode className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Store Info Modal Button */}
          <button
            id="open-store-info-btn"
            onClick={onOpenInfo}
            title="Información y Cuentas Bancarias"
            aria-label="Información del restaurante"
            className="bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 hover:text-white p-2 sm:p-2.5 rounded-xl border border-neutral-800 backdrop-blur-md transition-all hidden xs:flex items-center justify-center shadow-md active:scale-95 cursor-pointer"
          >
            <Info className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-300" />
          </button>

          {/* Direct WhatsApp Callout */}
          <a
            id="header-whatsapp-link"
            href="https://wa.me/573193574825?text=Hola%20Falcon's%20Alitas!%20Deseo%20hacer%20un%20pedido%20o%20consultar%20el%20menú"
            target="_blank"
            rel="noopener noreferrer"
            title="Contactar por WhatsApp"
            className="bg-neutral-900/80 hover:bg-neutral-800 text-emerald-400 p-2 sm:p-2.5 rounded-xl border border-neutral-800 hover:border-emerald-500/40 backdrop-blur-md transition-all flex items-center justify-center shadow-md active:scale-95 group"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 fill-current text-emerald-500 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/>
            </svg>
          </a>

          {/* Cart Trigger */}
          <button
            id="header-cart-btn"
            onClick={onOpenCart}
            className="relative bg-gradient-to-r from-red-600 via-brand-red to-amber-600 hover:from-red-500 hover:to-amber-500 text-white p-2 sm:px-3.5 sm:py-2.5 rounded-xl font-bold flex items-center gap-1.5 sm:gap-2 shadow-lg shadow-red-950/50 border border-amber-500/30 transition-all active:scale-95 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            <span className="hidden sm:inline text-xs tracking-wide uppercase font-extrabold">Carrito</span>
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-amber-400 text-black text-[10.5px] sm:text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-black shadow-md animate-bounce">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
