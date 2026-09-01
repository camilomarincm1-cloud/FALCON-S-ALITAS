import React, { useState, useEffect } from 'react';
import { Product, SelectedSauceItem, SelectedUpsellItem } from '../types';
import { AVAILABLE_SAUCES, UPSELL_OPTIONS } from '../data/menuData';
import { sanitizeText, sanitizeQuantity, sanitizeMoney, MAX_LENGTHS } from '../utils/security';
import { X, Plus, Minus, Sparkles, Flame, Check, Clock } from 'lucide-react';

interface ProductCustomizerModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (customizedItem: {
    product: Product;
    qty: number;
    variant?: string | null;
    sauces: SelectedSauceItem[];
    onion?: 'Sofrita' | 'Cruda' | 'Sin cebolla' | null;
    upsells: SelectedUpsellItem[];
    specialNotes: string;
    unitPrice: number;
  }) => void;
}

export const ProductCustomizerModal: React.FC<ProductCustomizerModalProps> = ({
  product,
  isOpen,
  onClose,
  onAddToCart
}) => {
  // Variant selection for products with options (e.g., drinks, arepa mechas)
  const [selectedVariant, setSelectedVariant] = useState<string>('');

  // Sauces selection (up to 3 included)
  const [selectedSauces, setSelectedSauces] = useState<string[]>([]);

  // Onion preparation (for burgers and hotdogs)
  const [selectedOnion, setSelectedOnion] = useState<'Sofrita' | 'Cruda' | 'Sin cebolla'>('Sofrita');

  // Upsells quantities: map of upsell ID -> quantity (for simple upsells without variants)
  const [upsellQuantities, setUpsellQuantities] = useState<Record<string, number>>({});

  // Upsell variant quantities: map of upsell ID -> { [variantName]: qty } (for upsells with multiple flavors/references)
  const [upsellVariantQuantities, setUpsellVariantQuantities] = useState<Record<string, Record<string, number>>>({});

  // Main product quantity
  const [quantity, setQuantity] = useState(1);
  const [specialNotes, setSpecialNotes] = useState('');

  useEffect(() => {
    if (isOpen && product) {
      const initialVariant = product.variants && product.variants.length > 0 ? product.variants[0] : '';
      setSelectedVariant(initialVariant);
      setSelectedSauces([]);
      setSelectedOnion('Sofrita');
      setUpsellQuantities({});
      setUpsellVariantQuantities({});
      setQuantity(1);
      setSpecialNotes('');
    }
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  const formatMoney = (amount: number) => '$' + Math.max(0, amount).toLocaleString('es-CO');

  const isSauceApplicable = product.category !== 'bebidas' && product.category !== 'adiciones';
  const isOnionApplicable = product.category === 'hamburguesas' || product.category === 'perros';
  const hasVariants = Boolean(product.variants && product.variants.length > 0);

  // Sauces handler (toggle with max 3)
  const toggleSauce = (sauceName: string) => {
    setSelectedSauces((prev) => {
      if (prev.includes(sauceName)) {
        return prev.filter((s) => s !== sauceName);
      }
      if (prev.length < 3) {
        return [...prev, sauceName];
      }
      return prev;
    });
  };

  // Upsells handlers (+ / -)
  // For simple upsells without variants
  const handleSimpleUpsellQtyChange = (upsellId: string, delta: number) => {
    const currentQty = upsellQuantities[upsellId] || 0;
    const nextQty = Math.max(0, currentQty + delta);
    setUpsellQuantities((prev) => {
      const updated = { ...prev };
      if (nextQty === 0) {
        delete updated[upsellId];
      } else {
        updated[upsellId] = nextQty;
      }
      return updated;
    });
  };

  // For upsells with variants (e.g., specific sauce flavors, soda flavors)
  const handleVariantUpsellQtyChange = (upsellId: string, variantName: string, delta: number) => {
    setUpsellVariantQuantities((prev) => {
      const currentUpsellMap = prev[upsellId] || {};
      const currentQty = currentUpsellMap[variantName] || 0;
      const nextQty = Math.max(0, currentQty + delta);
      
      const updatedUpsellMap = { ...currentUpsellMap };
      if (nextQty === 0) {
        delete updatedUpsellMap[variantName];
      } else {
        updatedUpsellMap[variantName] = nextQty;
      }

      const updated = { ...prev };
      if (Object.keys(updatedUpsellMap).length === 0) {
        delete updated[upsellId];
      } else {
        updated[upsellId] = updatedUpsellMap;
      }
      return updated;
    });
  };

  const getUpsellTotalQty = (upsellId: string, hasOptionVariants: boolean): number => {
    if (!hasOptionVariants) {
      return upsellQuantities[upsellId] || 0;
    }
    const variantMap = upsellVariantQuantities[upsellId] || {};
    const values = Object.values(variantMap) as number[];
    return values.reduce((a: number, b: number) => a + (Number(b) || 0), 0);
  };

  const getUpsellVariantQty = (upsellId: string, variantName: string): number => {
    return upsellVariantQuantities[upsellId]?.[variantName] || 0;
  };

  // Convert selected sauces to structured array
  const selectedSaucesList: SelectedSauceItem[] = selectedSauces.map((name) => ({ name, qty: 1 }));

  // Calculate dynamic upsells total with multi-flavor support
  const selectedUpsellsList: SelectedUpsellItem[] = [];

  UPSELL_OPTIONS.forEach((upsell) => {
    const hasOptVariants = Boolean(upsell.variants && upsell.variants.length > 0);
    if (!hasOptVariants) {
      const qty = Number(upsellQuantities[upsell.id]) || 0;
      if (qty > 0) {
        selectedUpsellsList.push({
          id: upsell.id,
          name: upsell.name,
          price: upsell.price,
          qty,
          variant: null
        });
      }
    } else {
      const variantMap = upsellVariantQuantities[upsell.id] || {};
      Object.entries(variantMap).forEach(([variantName, rawQty]) => {
        const qty = Number(rawQty) || 0;
        if (qty > 0) {
          selectedUpsellsList.push({
            id: upsell.id,
            name: upsell.name,
            price: upsell.price,
            qty,
            variant: variantName
          });
        }
      });
    }
  });

  const upsellsTotal = selectedUpsellsList.reduce((acc, u) => acc + u.price * u.qty, 0);
  const unitPrice = product.price + upsellsTotal;
  const totalPrice = unitPrice * quantity;

  const handleConfirm = () => {
    const cleanNotes = sanitizeText(specialNotes, MAX_LENGTHS.NOTES);
    const safeQty = sanitizeQuantity(quantity);
    const safeUnitPrice = sanitizeMoney(unitPrice);

    onAddToCart({
      product,
      qty: safeQty,
      variant: hasVariants ? (sanitizeText(selectedVariant, 40) || product.variants?.[0] || null) : null,
      sauces: isSauceApplicable ? selectedSaucesList : [],
      onion: isOnionApplicable ? selectedOnion : null,
      upsells: selectedUpsellsList,
      specialNotes: cleanNotes,
      unitPrice: safeUnitPrice
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 transform-gpu">
      <div
        id="product-customizer-dialog"
        className="bg-[#121212] w-full max-w-lg rounded-t-3xl sm:rounded-3xl border border-neutral-800 max-h-[90dvh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-6 sm:slide-in-from-bottom-2 duration-200 transform-gpu"
      >
        {/* Large Hero Image Showcase Banner */}
        <div className="relative w-full h-52 sm:h-64 bg-neutral-950 overflow-hidden shrink-0 border-b border-neutral-800/80 group">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              loading="eager"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1562967914-608f82629710?w=600&auto=format&fit=crop&q=80';
              }}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-7xl bg-neutral-900">
              <span>{product.imageEmoji || '🍔'}</span>
            </div>
          )}

          {/* Gradient Scrim for crisp text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/50 to-black/60 pointer-events-none" />

          {/* Top Control Bar: Badges on left, Close button on right (cleanly separated) */}
          <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between gap-3 pointer-events-none z-10">
            <div className="flex flex-wrap items-center gap-1.5 max-w-[calc(100%-48px)]">
              <span className="text-[10px] sm:text-[11px] bg-red-600/95 text-white border border-red-500/40 px-2.5 py-1 rounded-xl font-black uppercase tracking-wider backdrop-blur-md shadow-lg">
                Personalizar
              </span>
              {product.badge && (
                <span className="text-[10px] sm:text-[11px] bg-amber-400 text-black px-2.5 py-1 rounded-xl font-black uppercase tracking-wide shadow-lg">
                  {product.badge}
                </span>
              )}
            </div>

            <button
              id="close-customizer-btn"
              onClick={onClose}
              aria-label="Cerrar modal"
              className="pointer-events-auto text-white p-2 sm:p-2.5 rounded-xl bg-black/80 hover:bg-neutral-800 backdrop-blur-md border border-white/20 transition-all active:scale-95 shadow-xl cursor-pointer shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Bottom Info Bar: Product Title, Base Price & Independent Prep Time Notice */}
          <div className="absolute bottom-3 left-4 right-4 z-10 pointer-events-none">
            <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-white uppercase tracking-wide leading-tight drop-shadow-lg">
              {product.name}
            </h3>
            <div className="flex flex-wrap items-center justify-between gap-2 mt-1.5">
              <div className="flex items-center gap-1.5 bg-black/70 backdrop-blur-md px-3 py-1 rounded-xl border border-white/10 shadow-md">
                <span className="text-xs text-neutral-300 font-medium">Precio base:</span>
                <span className="text-lg sm:text-xl text-amber-400 font-black tracking-wide drop-shadow">
                  {formatMoney(product.price)}
                </span>
              </div>

              {product.prepTime && (
                <div className="flex items-center gap-1.5 bg-black/75 backdrop-blur-md text-amber-300 text-xs font-bold px-3 py-1 rounded-xl border border-amber-400/30 shadow-md">
                  <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Prep: {product.prepTime}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Scrollable Customization Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5 hide-scrollbar overscroll-contain flex-1">
          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed bg-neutral-950 p-3 rounded-xl border border-neutral-800/80">
            {product.description}
          </p>

          {/* 1. SELECCIÓN DE VARIANTE / SABOR PRINCIPAL (Si aplica) */}
          {hasVariants && product.variants && (
            <div className="space-y-2.5 bg-neutral-900/60 p-3.5 rounded-2xl border border-amber-500/40">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>Elige la opción o sabor de tu preferencia</span>
                </label>
                <span className="text-[10px] bg-amber-400 text-black px-2 py-0.5 rounded-full font-black uppercase">
                  Requerido
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {product.variants.map((v) => {
                  const isSelected = (selectedVariant || product.variants?.[0]) === v;
                  return (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setSelectedVariant(v)}
                      className={`px-3 py-2.5 rounded-xl text-xs border text-left transition-all flex items-center justify-between gap-2 cursor-pointer ${
                        isSelected
                          ? 'bg-amber-400 text-black font-extrabold border-amber-300 shadow-md scale-[1.01]'
                          : 'bg-neutral-950 border-neutral-800 text-neutral-200 hover:border-neutral-700 hover:bg-neutral-900'
                      }`}
                    >
                      <span className="leading-tight">{v}</span>
                      <span className="text-xs shrink-0">{isSelected ? '✅' : '⚪'}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. SALSAS GRATIS (HASTA 3) */}
          {isSauceApplicable && (
            <div className="space-y-2.5 bg-neutral-900/60 p-3.5 rounded-2xl border border-neutral-800/80">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <span>✨ BAÑA TU COMBO: Salsas artesanales (INCLUIDAS)</span>
                </label>
                <span
                  className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full border text-[11px] ${
                    selectedSauces.length === 3
                      ? 'bg-red-600/20 text-red-400 border-red-500/40'
                      : 'text-neutral-400 bg-neutral-800 border-neutral-700'
                  }`}
                >
                  {selectedSauces.length}/3
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {AVAILABLE_SAUCES.map((sauce) => {
                  const isSelected = selectedSauces.includes(sauce);
                  return (
                    <button
                      key={sauce}
                      type="button"
                      onClick={() => toggleSauce(sauce)}
                      className={`px-2.5 py-2 rounded-xl text-xs border text-center transition-all whitespace-normal break-words leading-tight flex items-center justify-center min-h-[38px] cursor-pointer ${
                        isSelected
                          ? 'bg-red-600/20 border-red-500 text-white font-bold shadow-sm shadow-red-950'
                          : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                      }`}
                    >
                      <span>{sauce}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. CEBOLLA (Hamburguesas / Perros) */}
          {isOnionApplicable && (
            <div className="space-y-2.5 bg-neutral-900/60 p-3.5 rounded-2xl border border-neutral-800/80">
              <label className="text-xs font-bold text-white uppercase tracking-wider block">
                Preparación de Cebolla
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Sofrita', 'Cruda', 'Sin cebolla'] as const).map((onion) => {
                  const isSelected = selectedOnion === onion;
                  return (
                    <button
                      key={onion}
                      type="button"
                      onClick={() => setSelectedOnion(onion)}
                      className={`px-3 py-2.5 rounded-xl text-xs border text-center transition-all font-semibold ${
                        isSelected
                          ? 'bg-[#E53E3E]/20 border-[#E53E3E] text-white font-bold shadow-sm'
                          : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                      }`}
                    >
                      {onion}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 4. ADICIONES Y EXTRAS CON CONTADORES DINÁMICOS (+ / -) Y CÁLCULO REACTIVO */}
          <div className="bg-neutral-900/60 p-3.5 rounded-2xl border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-amber-400 tracking-wider uppercase flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Potencia tu plato con Adiciones y Extras</span>
              </span>
              {upsellsTotal > 0 && (
                <span className="text-xs font-black text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-lg border border-amber-400/30">
                  +{formatMoney(upsellsTotal)}
                </span>
              )}
            </div>

            <div className="space-y-3">
              {UPSELL_OPTIONS.map((upsell) => {
                const hasOptVariants = Boolean(upsell.variants && upsell.variants.length > 0);
                const totalQty = getUpsellTotalQty(upsell.id, hasOptVariants);
                const isSelected = totalQty > 0;

                if (!hasOptVariants) {
                  // Caso 1: Adición simple sin variantes (Tocineta, Doble Queso, Papas Extra, Huevitos)
                  return (
                    <div
                      key={upsell.id}
                      className={`rounded-2xl border transition-all overflow-hidden ${
                        isSelected
                          ? 'bg-neutral-900/90 border-amber-400/60 shadow-md ring-1 ring-amber-400/20'
                          : 'bg-neutral-950 border-neutral-800/90 hover:border-neutral-700'
                      }`}
                    >
                      <div className="p-3 flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <span className={`text-xs font-bold leading-tight block ${isSelected ? 'text-amber-300 font-extrabold' : 'text-neutral-200'}`}>
                            {upsell.name}
                          </span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] font-bold text-amber-400">
                              +{formatMoney(upsell.price)} c/u
                            </span>
                            {totalQty > 1 && (
                              <span className="text-[11px] font-extrabold text-white bg-amber-500/20 px-1.5 py-0.2 rounded border border-amber-500/30">
                                Subtotal: +{formatMoney(upsell.price * totalQty)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Selector de Cantidad Numérica (+ / -) */}
                        <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-700 rounded-xl p-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleSimpleUpsellQtyChange(upsell.id, -1)}
                            disabled={totalQty === 0}
                            aria-label={`Restar ${upsell.name}`}
                            className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs transition-all ${
                              totalQty > 0
                                ? 'bg-neutral-800 text-white hover:bg-neutral-700 active:scale-95 cursor-pointer'
                                : 'text-neutral-600 cursor-not-allowed'
                            }`}
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className={`w-5 text-center text-sm font-black ${totalQty > 0 ? 'text-amber-400' : 'text-neutral-500'}`}>
                            {totalQty}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleSimpleUpsellQtyChange(upsell.id, 1)}
                            aria-label={`Sumar ${upsell.name}`}
                            className="w-7 h-7 rounded-lg bg-amber-400 text-black hover:bg-amber-300 active:scale-95 flex items-center justify-center font-black text-xs transition-all cursor-pointer shadow-sm"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                }

                // Caso 2: Adición con múltiples sabores/referencias (Salsas extra en bolsita, Gaseosas, etc.)
                return (
                  <div
                    key={upsell.id}
                    className={`rounded-2xl border transition-all overflow-hidden ${
                      isSelected
                        ? 'bg-neutral-900/90 border-amber-400/60 shadow-md ring-1 ring-amber-400/20'
                        : 'bg-neutral-950 border-neutral-800/90 hover:border-neutral-700'
                    }`}
                  >
                    {/* Header de la adición */}
                    <div className="p-3 bg-neutral-900/50 border-b border-neutral-800/80 flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-xs font-bold leading-tight ${isSelected ? 'text-amber-300 font-extrabold' : 'text-neutral-200'}`}>
                            {upsell.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] font-bold text-amber-400">
                            +{formatMoney(upsell.price)} c/u
                          </span>
                          <span className="text-[10px] text-neutral-400">
                            (Elige los sabores que desees)
                          </span>
                        </div>
                      </div>

                      {/* Contador total acumulado del grupo */}
                      <span
                        className={`text-xs font-black px-2.5 py-1 rounded-xl border shrink-0 ${
                          isSelected
                            ? 'bg-amber-400/20 text-amber-300 border-amber-400/40'
                            : 'bg-neutral-900 text-neutral-400 border-neutral-800'
                        }`}
                      >
                        {totalQty} {totalQty === 1 ? 'unidad' : 'unidades'} (+{formatMoney(upsell.price * totalQty)})
                      </span>
                    </div>

                    {/* Lista interactiva de sabores con selectores independientes (+ / -) */}
                    <div className="p-2.5 bg-neutral-950/60 space-y-1.5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {upsell.variants?.map((v) => {
                          const vQty = getUpsellVariantQty(upsell.id, v);
                          const isVSelected = vQty > 0;

                          return (
                            <div
                              key={v}
                              className={`p-2 rounded-xl border flex items-center justify-between gap-2 transition-all ${
                                isVSelected
                                  ? 'bg-neutral-900 border-amber-400/60 shadow-sm'
                                  : 'bg-neutral-900/40 border-neutral-800/70 hover:border-neutral-700'
                              }`}
                            >
                              <div className="flex-1 min-w-0">
                                <span className={`text-xs block truncate leading-tight ${isVSelected ? 'text-amber-300 font-bold' : 'text-neutral-300'}`}>
                                  {v}
                                </span>
                                {isVSelected && (
                                  <span className="text-[10px] font-bold text-neutral-400">
                                    +{formatMoney(upsell.price * vQty)}
                                  </span>
                                )}
                              </div>

                              {/* Contador individual para este sabor (+ / -) */}
                              <div className="flex items-center gap-1 bg-neutral-950 border border-neutral-700/80 rounded-lg p-0.5 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleVariantUpsellQtyChange(upsell.id, v, -1)}
                                  disabled={vQty === 0}
                                  aria-label={`Restar ${v}`}
                                  className={`w-6 h-6 rounded flex items-center justify-center font-bold text-xs transition-all ${
                                    vQty > 0
                                      ? 'bg-neutral-800 text-white hover:bg-neutral-700 active:scale-95 cursor-pointer'
                                      : 'text-neutral-600 cursor-not-allowed'
                                  }`}
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className={`w-4 text-center text-xs font-black ${vQty > 0 ? 'text-amber-400' : 'text-neutral-500'}`}>
                                  {vQty}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleVariantUpsellQtyChange(upsell.id, v, 1)}
                                  aria-label={`Sumar ${v}`}
                                  className="w-6 h-6 rounded bg-amber-400 text-black hover:bg-amber-300 active:scale-95 flex items-center justify-center font-black text-xs transition-all cursor-pointer shadow-sm"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 5. NOTAS ESPECIALES */}
          <div>
            <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider block mb-1">
              Instrucciones Especiales (Opcional)
            </label>
            <input
              type="text"
              value={specialNotes}
              onChange={(e) => setSpecialNotes(e.target.value)}
              placeholder="Ej: Bien tostada la tocineta, salsas aparte, sin verduras..."
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-red-500"
            />
          </div>

          {/* 6. CANTIDAD DEL PLATO */}
          <div className="flex items-center justify-between pt-2 border-t border-neutral-800">
            <div>
              <span className="text-xs font-bold text-white uppercase block">Cantidad de platos</span>
              <span className="text-[10px] text-neutral-400">
                {unitPrice > product.price ? `Precio unitario personalizado: ${formatMoney(unitPrice)}` : 'Unidades a preparar'}
              </span>
            </div>
            <div className="flex items-center gap-3 bg-neutral-900 border border-neutral-800 rounded-2xl p-1">
              <button
                type="button"
                id="qty-minus-btn"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 rounded-xl bg-neutral-800 text-white font-bold flex items-center justify-center hover:bg-neutral-700 active:scale-95 transition-all"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-sm font-black text-white w-6 text-center">
                {quantity}
              </span>
              <button
                type="button"
                id="qty-plus-btn"
                onClick={() => setQuantity(quantity + 1)}
                className="w-8 h-8 rounded-xl bg-neutral-800 text-white font-bold flex items-center justify-center hover:bg-neutral-700 active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer CTA Reactivo */}
        <div className="p-4 sm:p-5 pb-[calc(env(safe-area-inset-bottom,0px)+1rem)] border-t border-neutral-800 bg-neutral-900/80 shrink-0">
          <button
            id="confirm-add-cart-btn"
            onClick={handleConfirm}
            className="w-full bg-gradient-to-r from-[#E53E3E] to-red-700 hover:from-red-600 hover:to-[#E53E3E] text-white py-3.5 rounded-2xl font-extrabold text-sm tracking-wider uppercase shadow-xl shadow-red-600/30 transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer border border-red-500/30"
          >
            <span>AGREGAR AL CARRITO</span>
            <span>•</span>
            <span className="text-amber-300">{formatMoney(totalPrice)}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
