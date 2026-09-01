import React, { useState } from 'react';
import { CartItem, CustomerInfo } from '../types';
import { SAN_ANTONIO_NEIGHBORHOODS, PROMO_CODES } from '../data/menuData';
import { 
  sanitizeText, 
  sanitizePhone, 
  sanitizeMoney, 
  sanitizeQuantity, 
  MAX_LENGTHS, 
  buildWhatsAppOrderUrl,
  getSafeGpsPosition,
  validateAndSanitizeMapsUrl,
  GEO_COVERAGE_BOUNDS,
  validatePromoCode,
  recalculateOrderFinancials
} from '../utils/security';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  Send, 
  Tag, 
  MapPin, 
  CreditCard, 
  ShoppingBag, 
  CheckCircle2, 
  ChevronRight, 
  Navigation, 
  Compass, 
  ExternalLink, 
  Loader2, 
  AlertCircle,
  LocateFixed,
  ShieldCheck,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQty: (cartItemId: string, delta: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onClearCart: () => void;
  onOrderSuccess: (orderData: { summaryText: string; total: number; customer: CustomerInfo }) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
  onOrderSuccess
}) => {
  const [customer, setCustomer] = useState<CustomerInfo>({
    name: '',
    phone: '',
    address: '',
    neighborhood: SAN_ANTONIO_NEIGHBORHOODS[0].name,
    referencePoint: '',
    googleMapsUrl: '',
    orderType: 'delivery',
    tableNumber: '',
    paymentMethod: 'Nequi',
    cashChange: '',
    notes: '',
    promoCode: ''
  });

  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsSuccess, setGpsSuccess] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [gpsWarning, setGpsWarning] = useState<string | null>(null);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);

  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const formatMoney = (amount: number) => '$' + Math.max(0, amount).toLocaleString('es-CO');

  const subtotalProducts = cart.reduce((acc, item) => acc + item.unitPrice * item.qty, 0);

  // Delivery fee
  const selectedNeighborhoodObj = SAN_ANTONIO_NEIGHBORHOODS.find((n) => n.name === customer.neighborhood);
  const rawDeliveryFee = customer.orderType === 'delivery' ? (selectedNeighborhoodObj?.fee || 4000) : 0;

  // Reconcile order financials with cryptographic validation
  const financials = recalculateOrderFinancials({
    items: cart.map(i => ({ unitPrice: i.unitPrice, qty: i.qty })),
    promoCode: appliedPromo || undefined,
    orderType: customer.orderType,
    deliveryFee: rawDeliveryFee
  });

  const safeSubtotal = financials.subtotal;
  const safeDiscount = financials.discount;
  const safeDelivery = financials.deliveryFee;
  const grandTotal = financials.grandTotal;

  const handleApplyPromo = () => {
    const code = sanitizeText(promoInput, MAX_LENGTHS.PROMO_CODE).toUpperCase();
    if (!code) return;
    
    const promoResult = validatePromoCode(code, safeSubtotal);
    if (promoResult.valid) {
      setAppliedPromo(code);
      setPromoError(null);
      try {
        confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
      } catch {}
    } else {
      setPromoError(promoResult.error || 'Cupón no válido o vencido');
    }
  };

  const handleGetGpsLocation = async () => {
    setGpsLoading(true);
    setGpsError(null);
    setGpsWarning(null);

    const result = await getSafeGpsPosition();
    setGpsLoading(false);

    if (result.success && result.mapsUrl) {
      setCustomer((prev) => ({
        ...prev,
        googleMapsUrl: result.mapsUrl
      }));
      setGpsAccuracy(result.accuracy ?? null);
      setGpsSuccess(true);
      setGpsError(null);
      setGpsWarning(null);
    } else {
      setGpsSuccess(false);
      if (result.isOutOfRange) {
        setGpsWarning(result.error || 'Ubicación fuera del área de cobertura.');
      } else {
        setGpsError(result.error || 'No se pudo obtener la señal GPS. Puedes ingresar tu dirección manual.');
      }
    }
  };

  const handleManualMapsUrlChange = (value: string) => {
    const clean = sanitizeText(value, MAX_LENGTHS.GOOGLE_MAPS_URL);
    setCustomer((prev) => ({ ...prev, googleMapsUrl: clean }));

    if (!clean) {
      setGpsWarning(null);
      setGpsError(null);
      return;
    }

    const validation = validateAndSanitizeMapsUrl(clean);
    if (!validation.valid && validation.warning) {
      setGpsWarning(validation.warning);
    } else {
      setGpsWarning(null);
      setGpsError(null);
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    const cleanName = sanitizeText(customer.name, MAX_LENGTHS.NAME);
    if (!cleanName) {
      errors.name = 'El nombre es obligatorio';
    }
    if (customer.orderType === 'delivery') {
      const cleanAddress = sanitizeText(customer.address, MAX_LENGTHS.ADDRESS);
      if (!cleanAddress || cleanAddress.length < 4) {
        errors.address = 'Ingresa una dirección precisa (Calle/Cra, número, casa/apto)';
      }
    }
    if (customer.orderType === 'table') {
      const cleanTable = sanitizeText(customer.tableNumber, MAX_LENGTHS.TABLE_NUMBER);
      if (!cleanTable) {
        errors.tableNumber = 'Ingresa el número de mesa';
      }
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSendOrder = () => {
    if (cart.length === 0) return;
    if (!validateForm()) return;

    // Trigger celebratory confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }

    // Sanitize all customer inputs before message construction
    const cleanName = sanitizeText(customer.name, MAX_LENGTHS.NAME);
    const cleanPhone = sanitizePhone(customer.phone);
    const cleanAddress = sanitizeText(customer.address, MAX_LENGTHS.ADDRESS);
    const cleanReference = sanitizeText(customer.referencePoint, MAX_LENGTHS.REFERENCE_POINT);
    const cleanNeighborhood = sanitizeText(customer.neighborhood, MAX_LENGTHS.NEIGHBORHOOD);
    const cleanMapsUrl = customer.googleMapsUrl ? sanitizeText(customer.googleMapsUrl, MAX_LENGTHS.GOOGLE_MAPS_URL) : '';
    const cleanTable = sanitizeText(customer.tableNumber, MAX_LENGTHS.TABLE_NUMBER);
    const cleanCash = sanitizeText(customer.cashChange, MAX_LENGTHS.CASH_CHANGE);
    const cleanNotes = sanitizeText(customer.notes, MAX_LENGTHS.NOTES);

    // Build Formatted WhatsApp Order Message (Commercial, Persuasive, Brand-Loyalty & Universal iOS/Android Emoji Compatible)
    let msg = `🍗🔥 *¡HOLA FALCON'S ALITAS! Quiero hacer mi pedido express* 🍗🔥\n`;
    msg += `------------------------------------\n`;
    msg += `👤 *Mi Nombre:* ${cleanName}\n`;
    if (cleanPhone) {
      msg += `📱 *Mi WhatsApp:* ${cleanPhone}\n`;
    }

    if (customer.orderType === 'delivery') {
      msg += `🛵 *Modalidad:* Servicio a Domicilio 🚀\n`;
      msg += `📍 *Dirección de Entrega:* ${cleanAddress}\n`;
      if (cleanReference) {
        msg += `🏢 *Punto de Referencia / Torre / Apto:* ${cleanReference}\n`;
      }
      msg += `🏠 *Barrio / Sector:* ${cleanNeighborhood}\n`;
      if (cleanMapsUrl) {
        msg += `🗺️ *Ubicación Google Maps (GPS):* ${cleanMapsUrl}\n`;
      }
    } else if (customer.orderType === 'pickup') {
      msg += `📦 *Modalidad:* Pasar a Recoger en Sede (Calle 48D Sur N. 55C - 04)\n`;
    } else {
      msg += `🍴 *Modalidad:* Consumo en Local - *Mesa #${cleanTable}*\n`;
    }

    msg += `💳 *Forma de Pago:* ${customer.paymentMethod}`;
    if (customer.paymentMethod === 'Efectivo' && cleanCash) {
      msg += ` (Pagaré con: ${cleanCash} - Requiere cambio)`;
    }
    msg += `\n`;

    if (customer.paymentMethod === 'Nequi' || customer.paymentMethod === 'Bancolombia') {
      msg += `📸 *Comprobante de Transferencia:* Adjunto el pantallazo en este chat para verificar en cocina y confirmar mi pedido de inmediato. ✅\n`;
    }

    if (cleanNotes) {
      msg += `📝 *Observaciones Especiales:* ${cleanNotes}\n`;
    }

    msg += `------------------------------------\n`;
    msg += `📋 *ESPECIFICACIONES PARA PREPARACIÓN (COCINA):*\n\n`;

    cart.forEach((item, index) => {
      const safeQty = sanitizeQuantity(item.qty);
      const safeUnitPrice = sanitizeMoney(item.unitPrice);
      const safeSub = sanitizeMoney(safeUnitPrice * safeQty);

      msg += `*${index + 1}. ${safeQty}x ${sanitizeText(item.product.name)}*`;
      if (item.variant) {
        msg += ` [Ref: ${sanitizeText(item.variant)}]`;
      }
      msg += ` - ${formatMoney(safeSub)}\n`;

      if (item.onion) {
        msg += `   • Cebolla: ${item.onion}\n`;
      }

      if (item.sauces && item.sauces.length > 0) {
        const sauceList = item.sauces
          .map((s) => `${s.qty > 1 ? s.qty + 'x ' : ''}${sanitizeText(s.name)}`)
          .join(', ');
        msg += `   • Salsas elegidas: ${sauceList}\n`;
      }

      if (item.upsells && item.upsells.length > 0) {
        const upsellList = item.upsells
          .map((u) => {
            const uQty = u.qty || 1;
            const uName = sanitizeText(u.name);
            const uVar = u.variant ? ` (${sanitizeText(u.variant)})` : '';
            return `${uQty > 1 ? uQty + 'x ' : ''}${uName}${uVar}`;
          })
          .join(', ');
        msg += `   • Adiciones / Acompañamientos: ${upsellList}\n`;
      }

      if (item.specialNotes) {
        msg += `   • Nota de cocina: "${sanitizeText(item.specialNotes)}"\n`;
      }

      msg += `\n`;
    });

    msg += `------------------------------------\n`;
    msg += `💰 *RESUMEN DE PAGO:*\n`;
    msg += `• Subtotal Comida: ${formatMoney(safeSubtotal)}\n`;
    if (safeDiscount > 0 && appliedPromo) {
      msg += `• Descuento Promocional (${appliedPromo}): -${formatMoney(safeDiscount)}\n`;
    }
    if (customer.orderType === 'delivery') {
      msg += `• Domicilio (${cleanNeighborhood}): ${formatMoney(safeDelivery)}\n`;
    }
    msg += `🔥 *TOTAL NETO A PAGAR:* *${formatMoney(grandTotal)}*\n`;
    msg += `------------------------------------\n`;
    msg += `¡Muchas gracias! Quedo super atento(a) a su confirmación y al tiempo estimado de entrega. ¡El mejor sabor de Prado! 🚀🔥`;

    const phone = '573193574825';
    const whatsappUrl = buildWhatsAppOrderUrl(phone, msg);

    // Persist order state and notify parent
    onOrderSuccess({
      summaryText: msg,
      total: grandTotal,
      customer
    });

    // Open WhatsApp
    window.location.href = whatsappUrl;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-md flex justify-end transform-gpu">
      <div
        id="cart-drawer-panel"
        className="bg-[#0A0A0A] w-full max-w-lg h-[100dvh] max-h-[100dvh] flex flex-col justify-between border-l border-neutral-800 shadow-2xl animate-in slide-in-from-right duration-200 transform-gpu overflow-hidden"
      >
        {/* Top Cart Header */}
        <div className="p-4 sm:p-5 pt-[calc(env(safe-area-inset-top,0px)+1rem)] border-b border-neutral-800 flex justify-between items-center bg-neutral-900/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white uppercase tracking-wider leading-none">
              Tu Pedido
            </h2>
            <span className="bg-[#E53E3E] text-white text-xs font-extrabold px-2.5 py-0.5 rounded-full">
              {cart.reduce((acc, i) => acc + i.qty, 0)} items
            </span>
          </div>

          <div className="flex items-center gap-2">
            {cart.length > 0 && (
              <button
                onClick={onClearCart}
                title="Vaciar carrito"
                className="text-neutral-500 hover:text-red-400 p-2 text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              id="close-cart-btn"
              onClick={onClose}
              className="text-neutral-400 hover:text-white p-2 rounded-xl bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Cart Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-6 flex-1 hide-scrollbar overscroll-contain">
          {cart.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-4xl">
                🍗
              </div>
              <h3 className="font-display text-2xl text-white font-bold uppercase tracking-wide">
                Tu canasta está vacía
              </h3>
              <p className="text-xs text-neutral-400 max-w-xs mx-auto">
                Agrega alitas, hamburguesas gourmet o combos para armar tu pedido express.
              </p>
              <button
                onClick={onClose}
                className="bg-[#E53E3E] hover:bg-[#C53030] text-white text-xs font-extrabold px-5 py-2.5 rounded-xl uppercase tracking-wider transition-all"
              >
                Explorar Menú
              </button>
            </div>
          ) : (
            <>
              {/* Product Items List */}
              <div className="space-y-3">
                {cart.map((item) => (
                  <div
                    key={item.cartItemId}
                    className="bg-[#141414] p-3.5 rounded-2xl border border-neutral-800 flex items-start gap-3 relative group"
                  >
                    {/* Item Thumbnail */}
                    <div className="w-12 h-12 rounded-xl bg-neutral-900 border border-neutral-800 shrink-0 overflow-hidden flex items-center justify-center relative">
                      {item.product.image ? (
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          loading="lazy"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1562967914-608f82629710?w=600&auto=format&fit=crop&q=80';
                          }}
                          className="w-full h-full object-cover rounded-xl"
                        />
                      ) : (
                        <span className="text-xl select-none">{item.product.imageEmoji || '🍔'}</span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs sm:text-sm font-bold text-white leading-snug truncate">
                          {item.product.name}
                        </h4>
                        <span className="font-display text-base font-bold text-amber-400 ml-2 shrink-0">
                          {formatMoney(item.unitPrice * item.qty)}
                        </span>
                      </div>

                      {/* Variant Badge */}
                      {item.variant && (
                        <div className="inline-flex items-center gap-1 mt-1 text-[10px] font-extrabold text-amber-300 bg-amber-950/70 border border-amber-500/40 px-2 py-0.5 rounded-md">
                          <span>👉</span>
                          <span>Ref: {item.variant}</span>
                        </div>
                      )}

                      {/* Sauces tags */}
                      {item.sauces && item.sauces.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5 items-center">
                          <span className="text-[10px] text-neutral-400">Salsas:</span>
                          {item.sauces.map((s, sIdx) => {
                            const label = typeof s === 'string' ? s : `${s.qty}x ${s.name}`;
                            return (
                              <span
                                key={sIdx}
                                className="text-[10px] bg-neutral-800 text-neutral-200 px-1.5 py-0.5 rounded font-medium border border-neutral-700/60"
                              >
                                {label}
                              </span>
                            );
                          })}
                        </div>
                      )}

                      {/* Onion tag */}
                      {item.onion && (
                        <p className="text-[10px] text-neutral-400 mt-1">
                          Cebolla: <span className="text-amber-300 font-semibold">{item.onion}</span>
                        </p>
                      )}

                      {/* Upsells */}
                      {item.upsells && item.upsells.length > 0 && (
                        <div className="mt-1 space-y-0.5">
                          {item.upsells.map((u, uIdx) => {
                            const uQty = u.qty || 1;
                            return (
                              <div key={uIdx} className="text-[10.5px] text-amber-300 font-semibold flex items-center gap-1">
                                <span>➕</span>
                                <span>
                                  {uQty}x {u.name} {u.variant ? `[Ref: ${u.variant}]` : ''} (+{formatMoney(u.price * uQty)})
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Special instructions */}
                      {item.specialNotes && (
                        <p className="text-[10px] text-neutral-400 italic mt-1">
                          Nota: "{item.specialNotes}"
                        </p>
                      )}
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex flex-col items-end justify-between shrink-0 pl-1">
                      <button
                        onClick={() => onRemoveItem(item.cartItemId)}
                        className="text-neutral-500 hover:text-red-400 p-1 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <div className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 rounded-xl p-1">
                        <button
                          onClick={() => onUpdateQty(item.cartItemId, -1)}
                          className="w-6 h-6 rounded-lg bg-neutral-800 text-white font-bold text-xs flex items-center justify-center hover:bg-neutral-700 active:scale-95"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold text-white w-4 text-center">
                          {item.qty}
                        </span>
                        <button
                          onClick={() => onUpdateQty(item.cartItemId, 1)}
                          className="w-6 h-6 rounded-lg bg-neutral-800 text-white font-bold text-xs flex items-center justify-center hover:bg-neutral-700 active:scale-95"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Type Selector */}
              <div className="bg-neutral-900/60 p-3.5 rounded-2xl border border-neutral-800 space-y-2">
                <label className="text-xs font-bold text-white uppercase tracking-wider block">
                  Modalidad del Pedido
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setCustomer({ ...customer, orderType: 'delivery' })}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all text-center ${
                      customer.orderType === 'delivery'
                        ? 'bg-[#E53E3E] text-white border-[#E53E3E] shadow-md shadow-red-600/30'
                        : 'bg-neutral-950 text-neutral-400 border-neutral-800'
                    }`}
                  >
                    🛵 Domicilio
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomer({ ...customer, orderType: 'pickup' })}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all text-center ${
                      customer.orderType === 'pickup'
                        ? 'bg-[#E53E3E] text-white border-[#E53E3E] shadow-md shadow-red-600/30'
                        : 'bg-neutral-950 text-neutral-400 border-neutral-800'
                    }`}
                  >
                    🛍️ Recoger
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomer({ ...customer, orderType: 'table' })}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all text-center ${
                      customer.orderType === 'table'
                        ? 'bg-[#E53E3E] text-white border-[#E53E3E] shadow-md shadow-red-600/30'
                        : 'bg-neutral-950 text-neutral-400 border-neutral-800'
                    }`}
                  >
                    🍽️ En Mesa
                  </button>
                </div>
              </div>

              {/* Customer Delivery Details Form */}
              <div className="bg-neutral-900/60 p-4 rounded-2xl border border-neutral-800 space-y-3.5">
                <h3 className="font-display text-xl font-bold text-amber-400 tracking-wide uppercase border-b border-neutral-800 pb-1.5 flex items-center justify-between">
                  <span>Datos del Cliente</span>
                  <span className="text-[10px] text-neutral-400 font-normal">
                    {customer.orderType === 'delivery' ? 'San Antonio de Prado' : 'Local Falcon'}
                  </span>
                </h3>

                {/* Name */}
                <div>
                  <label className="text-[11px] font-bold text-neutral-300 uppercase block mb-1">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    value={customer.name}
                    onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                    placeholder="Ej: Camilo Marín"
                    className={`w-full bg-neutral-950 border rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none ${
                      formErrors.name ? 'border-red-500' : 'border-neutral-800 focus:border-red-500'
                    }`}
                  />
                  {formErrors.name && (
                    <span className="text-[10px] text-red-400 mt-0.5 block">{formErrors.name}</span>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="text-[11px] font-bold text-neutral-300 uppercase block mb-1">
                    Teléfono / Celular (Opcional)
                  </label>
                  <input
                    type="tel"
                    value={customer.phone}
                    onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                    placeholder="Ej: 319 357 4825"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-red-500"
                  />
                </div>

                {/* Table Number if In-Store */}
                {customer.orderType === 'table' && (
                  <div>
                    <label className="text-[11px] font-bold text-amber-300 uppercase block mb-1">
                      Número de Mesa *
                    </label>
                    <input
                      type="text"
                      value={customer.tableNumber || ''}
                      onChange={(e) => setCustomer({ ...customer, tableNumber: e.target.value })}
                      placeholder="Ej: Mesa 3"
                      className={`w-full bg-neutral-950 border rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none ${
                        formErrors.tableNumber ? 'border-red-500' : 'border-neutral-800 focus:border-amber-400'
                      }`}
                    />
                    {formErrors.tableNumber && (
                      <span className="text-[10px] text-red-400 mt-0.5 block">{formErrors.tableNumber}</span>
                    )}
                  </div>
                )}

                {/* Address, Reference, Barrio & GPS Geolocation if Delivery */}
                {customer.orderType === 'delivery' && (
                  <div className="space-y-3.5 bg-black/40 p-3.5 rounded-2xl border border-neutral-800">
                    <div className="flex items-center justify-between pb-1 border-b border-neutral-800/80">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                        <MapPin className="w-3.5 h-3.5 text-red-500" />
                        <span>Logística y Destino de Entrega</span>
                      </div>
                      <span className="text-[10px] text-neutral-400 font-medium">San Antonio de Prado</span>
                    </div>

                    {/* Dirección Exacta */}
                    <div>
                      <label className="text-[11px] font-bold text-neutral-200 uppercase block mb-1">
                        Dirección Exacta (Calle/Cra, #, Casa o Apto) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={customer.address}
                        onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                        placeholder="Ej: Calle 48D Sur # 55C - 04 (Torre 2 Apto 402)"
                        className={`w-full bg-neutral-950 border rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none transition-all ${
                          formErrors.address ? 'border-red-500 ring-1 ring-red-500/50' : 'border-neutral-800 focus:border-red-500'
                        }`}
                      />
                      {formErrors.address ? (
                        <span className="text-[10px] text-red-400 mt-1 block font-medium">{formErrors.address}</span>
                      ) : (
                        <span className="text-[10px] text-neutral-400 mt-0.5 block">
                          Incluye número de casa, piso, interior o bloque para agilizar la entrega.
                        </span>
                      )}
                    </div>

                    {/* Punto de Referencia / Indicaciones de llegada */}
                    <div>
                      <label className="text-[11px] font-bold text-neutral-300 uppercase block mb-1">
                        Punto de Referencia / Indicación para el Domiciliario
                      </label>
                      <input
                        type="text"
                        value={customer.referencePoint || ''}
                        onChange={(e) => setCustomer({ ...customer, referencePoint: e.target.value })}
                        placeholder="Ej: Frente al parque, casa blanca de reja negra, portón verde"
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                      />
                      <span className="text-[10px] text-neutral-400 mt-0.5 block">
                        Ayuda al domiciliario a ubicar tu puerta sin demoras ni llamadas.
                      </span>
                    </div>

                    {/* Sector / Barrio */}
                    <div>
                      <label className="text-[11px] font-bold text-neutral-300 uppercase block mb-1">
                        Sector / Barrio (San Antonio de Prado) <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={customer.neighborhood}
                        onChange={(e) => setCustomer({ ...customer, neighborhood: e.target.value })}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 font-medium"
                      >
                        {SAN_ANTONIO_NEIGHBORHOODS.map((n) => (
                          <option key={n.name} value={n.name}>
                            {n.name} {n.fee > 0 ? `(+${formatMoney(n.fee)})` : '(Gratis)'} • {n.estimatedMinutes}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* GPS Geolocation & Google Maps Link Module */}
                    <div className="bg-gradient-to-br from-neutral-950 via-neutral-900 to-amber-950/20 p-3.5 rounded-xl border border-amber-500/30 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-300">
                          <Navigation className="w-3.5 h-3.5 text-amber-400" />
                          <span>Ubicación GPS en Google Maps (Opcional)</span>
                        </div>
                        {customer.googleMapsUrl && !gpsWarning ? (
                          <span className="text-[9px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.5 rounded uppercase flex items-center gap-1">
                            <ShieldCheck className="w-2.5 h-2.5" />
                            GPS Válido
                          </span>
                        ) : (
                          <span className="text-[9px] font-medium text-neutral-400 bg-neutral-900 border border-neutral-800 px-1.5 py-0.5 rounded">
                            Zona San Antonio de Prado
                          </span>
                        )}
                      </div>

                      <p className="text-[10.5px] text-neutral-300 leading-relaxed">
                        Comparte tu ubicación satelital en tiempo real para que el repartidor abra la ruta exacta en su GPS. Si no deseas compartir GPS, no te preocupes: tu dirección manual escrita arriba es suficiente.
                      </p>

                      <div className="pt-0.5">
                        <button
                          type="button"
                          onClick={handleGetGpsLocation}
                          disabled={gpsLoading}
                          className="w-full bg-neutral-900 hover:bg-neutral-800 active:scale-95 disabled:opacity-50 border border-amber-400/50 hover:border-amber-400 text-amber-300 hover:text-white py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                        >
                          {gpsLoading ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                              <span>Detectando señal satelital segura...</span>
                            </>
                          ) : (
                            <>
                              <LocateFixed className="w-3.5 h-3.5 text-amber-400" />
                              <span>{customer.googleMapsUrl ? 'Actualizar mi Ubicación GPS' : 'Obtener mi Ubicación GPS Actual'}</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* GPS Error message (Permission denied / Unavailable) */}
                      {gpsError && (
                        <div className="p-2.5 rounded-lg bg-neutral-900/90 border border-amber-500/30 text-[10.5px] text-neutral-200 flex items-start gap-2">
                          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                          <div className="space-y-1">
                            <p className="text-amber-200 font-medium">{gpsError}</p>
                            <p className="text-neutral-400 text-[10px]">
                              El pedido continuará sin problemas con los datos que escribiste en <strong>Dirección Exacta</strong> y <strong>Punto de Referencia</strong>.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* GPS Out of Range or invalid format Warning */}
                      {gpsWarning && (
                        <div className="p-2.5 rounded-lg bg-red-950/70 border border-red-500/40 text-[10.5px] text-red-200 flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                          <div className="space-y-1">
                            <p className="font-semibold text-red-300">{gpsWarning}</p>
                            <p className="text-neutral-300 text-[10px]">
                              Falcon&apos;s Alitas opera en San Antonio de Prado, Itagüí y zona sur de Medellín. Por favor valida tu dirección manual.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* GPS Success or Manual Link Field */}
                      {customer.googleMapsUrl ? (
                        <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/40 space-y-1.5 text-left">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-emerald-300 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              <span>Enlace de Google Maps verificado:</span>
                            </span>
                            <a
                              href={customer.googleMapsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-amber-300 hover:text-white underline flex items-center gap-0.5 font-bold"
                            >
                              <span>Ver en Mapa</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          </div>
                          <input
                            type="text"
                            value={customer.googleMapsUrl}
                            onChange={(e) => handleManualMapsUrlChange(e.target.value)}
                            placeholder="https://www.google.com/maps?q=..."
                            className="w-full bg-neutral-950 border border-emerald-500/30 rounded-lg px-2 py-1 text-[10px] text-emerald-200 focus:outline-none focus:border-emerald-400 font-mono"
                          />
                          <div className="flex items-center justify-between text-[9px] text-neutral-400 pt-0.5">
                            {gpsAccuracy !== null && (
                              <span>Precisión satelital aproximada: ±{gpsAccuracy}m</span>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setCustomer((prev) => ({ ...prev, googleMapsUrl: '' }));
                                setGpsWarning(null);
                                setGpsError(null);
                              }}
                              className="text-neutral-400 hover:text-red-400 underline cursor-pointer"
                            >
                              Quitar enlace
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <label className="text-[10px] text-neutral-400 block mb-0.5">
                            O pega un enlace directo de Google Maps si ya lo tienes:
                          </label>
                          <input
                            type="text"
                            value={customer.googleMapsUrl || ''}
                            onChange={(e) => handleManualMapsUrlChange(e.target.value)}
                            placeholder="https://maps.app.goo.gl/... o https://google.com/maps?q=..."
                            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2 py-1 text-[11px] text-neutral-300 placeholder-neutral-600 focus:outline-none focus:border-amber-400"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Payment Method */}
                <div>
                  <label className="text-[11px] font-bold text-neutral-300 uppercase block mb-1">
                    Método de Pago *
                  </label>
                  <select
                    value={customer.paymentMethod}
                    onChange={(e) =>
                      setCustomer({
                        ...customer,
                        paymentMethod: e.target.value as 'Nequi' | 'Bancolombia' | 'Efectivo'
                      })
                    }
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="Nequi">Nequi (Transferencia a cuenta 609 4453 0676)</option>
                    <option value="Bancolombia">Bancolombia (Transferencia a cuenta 609 4453 0676)</option>
                    <option value="Efectivo">Efectivo contra entrega</option>
                  </select>
                </div>

                {/* Transfer Proof Required Alert Banner (Nequi / Bancolombia) */}
                {(customer.paymentMethod === 'Nequi' || customer.paymentMethod === 'Bancolombia') && (
                  <div className="bg-gradient-to-r from-amber-950/80 via-neutral-900 to-amber-950/70 border-2 border-amber-500/60 rounded-2xl p-3.5 shadow-lg shadow-amber-950/30 animate-in fade-in slide-in-from-top-2 duration-300 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-amber-300 uppercase tracking-wide flex items-center gap-1.5">
                          <span>📸 Anexar Comprobante de Transferencia</span>
                        </h4>
                        <p className="text-[10px] text-amber-200/80 font-medium">
                          Cuenta {customer.paymentMethod}: <strong className="text-white">609 4453 0676</strong> (Ahorros)
                        </p>
                      </div>
                    </div>

                    <div className="bg-black/60 rounded-xl p-2.5 border border-amber-500/30 text-[11px] text-neutral-200 leading-relaxed">
                      <p className="text-amber-100 font-semibold flex items-start gap-1.5">
                        <span className="text-amber-400 text-sm leading-none shrink-0 mt-0.5">⚠️</span>
                        <span>
                          Para que tu pedido sea despachado y confirmado en cocina, <strong>debes adjuntar el pantallazo de la transferencia</strong> en el chat de WhatsApp al enviar este pedido.
                        </span>
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-neutral-400 pt-0.5 px-1">
                      <span className="flex items-center gap-1 text-emerald-400 font-bold">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        Verificación rápida en WhatsApp
                      </span>
                      <span className="text-neutral-500">Paso obligatorio</span>
                    </div>
                  </div>
                )}

                {/* Cash change helper */}
                {customer.paymentMethod === 'Efectivo' && (
                  <div>
                    <label className="text-[11px] font-bold text-amber-300 uppercase block mb-1">
                      ¿Con cuánto pagas? (Para llevarte devueltas)
                    </label>
                    <input
                      type="text"
                      value={customer.cashChange}
                      onChange={(e) => setCustomer({ ...customer, cashChange: e.target.value })}
                      placeholder="Ej: Pago con billete de $50.000"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-red-500"
                    />
                  </div>
                )}

                {/* Special Notes */}
                <div>
                  <label className="text-[11px] font-bold text-neutral-300 uppercase block mb-1">
                    Instrucciones de Entrega / Notas
                  </label>
                  <textarea
                    value={customer.notes}
                    onChange={(e) => setCustomer({ ...customer, notes: e.target.value })}
                    placeholder="Ej: Timbre no sirve, timbrar en apto 201 o llamar al llegar..."
                    rows={2}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-red-500 resize-none"
                  />
                </div>

                {/* Promo Code Input */}
                <div className="pt-1">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      placeholder="Código Cupón (Ej: FALCONS10)"
                      className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-white uppercase placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                    />
                    <button
                      type="button"
                      onClick={handleApplyPromo}
                      className="bg-neutral-800 hover:bg-neutral-700 text-amber-300 text-xs font-bold px-3 py-1.5 rounded-xl border border-neutral-700 transition-all shrink-0"
                    >
                      Aplicar
                    </button>
                  </div>
                  {appliedPromo && (
                    <p className="text-[11px] text-green-400 mt-1 flex items-center gap-1 font-semibold">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{PROMO_CODES[appliedPromo].description}</span>
                    </p>
                  )}
                  {promoError && (
                    <p className="text-[11px] text-red-400 mt-1">{promoError}</p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Cart Bottom Summary & WhatsApp Action */}
        {cart.length > 0 && (
          <div className="p-4 sm:p-5 pb-[calc(env(safe-area-inset-bottom,0px)+1.25rem)] border-t border-neutral-800 bg-neutral-900/95 space-y-3 shadow-2xl shrink-0">
            {/* Price Calculations */}
            <div className="space-y-1.5 text-xs text-neutral-300">
              <div className="flex justify-between">
                <span>Subtotal Productos:</span>
                <span className="font-semibold text-white">{formatMoney(safeSubtotal)}</span>
              </div>
              {safeDiscount > 0 && (
                <div className="flex justify-between text-green-400 font-semibold">
                  <span>Descuento Cupón ({appliedPromo}):</span>
                  <span>-{formatMoney(safeDiscount)}</span>
                </div>
              )}
              {customer.orderType === 'delivery' && (
                <div className="flex justify-between">
                  <span>Costo de Domicilio ({customer.neighborhood}):</span>
                  <span className="font-semibold text-white">{formatMoney(safeDelivery)}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2 border-t border-neutral-800 text-sm font-bold text-white">
                <span className="text-neutral-200">Total a Pagar:</span>
                <span className="font-display text-2xl sm:text-3xl text-amber-400 tracking-wide font-bold">
                  {formatMoney(grandTotal)}
                </span>
              </div>
            </div>

            {/* Direct WhatsApp CTA Button */}
            <button
              id="send-whatsapp-order-btn"
              onClick={handleSendOrder}
              className="w-full bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-600 hover:from-emerald-500 hover:to-green-500 text-white py-4 rounded-2xl font-extrabold text-sm sm:text-base tracking-wider uppercase shadow-2xl shadow-green-900/40 transition-all flex items-center justify-center gap-2.5 active:scale-98 group border border-emerald-400/30"
            >
              <svg className="w-5 h-5 fill-current text-white group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/>
              </svg>
              <span>Enviar Pedido por WhatsApp 🚀</span>
            </button>
            <p className="text-[10px] text-neutral-500 text-center leading-tight">
              Al hacer clic serás redirigido a WhatsApp para confirmar tu pedido directamente con Falcon's Alitas.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
