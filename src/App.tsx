import React, { useState, useEffect } from 'react';
import { ProductCategory, Product, CartItem, CustomerInfo, SelectedSauceItem, SelectedUpsellItem } from './types';
import { CATEGORIES, PRODUCTS as INITIAL_PRODUCTS } from './data/menuData';
import { Header } from './components/Header';
import { Hero3DViewer } from './components/Hero3DViewer';
import { CategoryTabs } from './components/CategoryTabs';
import { ProductCard } from './components/ProductCard';
import { ProductCustomizerModal } from './components/ProductCustomizerModal';
import { CartDrawer } from './components/CartDrawer';
import { QRCodeModal } from './components/QRCodeModal';
import { StoreInfoModal } from './components/StoreInfoModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { AdminCMSModal } from './components/AdminCMSModal';
import { ShoppingBag, ChevronRight, Sparkles, MapPin, Phone, Clock, Flame, ShieldCheck } from 'lucide-react';

export default function App() {
  const [activeCategory, setActiveCategory] = useState<ProductCategory>('papas');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isQROpen, setIsQROpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Products state loaded from localStorage if custom modifications exist
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('falcons_custom_products');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Normalize to ensure any missing fields or paths use corporate src/assets/images
          return parsed.map((p: any) => {
            const defaultProd = INITIAL_PRODUCTS.find((d) => d.id === p.id);
            return {
              ...defaultProd,
              ...p,
              image: (defaultProd?.image && defaultProd.image.startsWith('/images/')) ? defaultProd.image : (p.image || defaultProd?.image)
            };
          });
        }
      }
    } catch (e) {
      console.warn('Error loading custom products from localStorage', e);
    }
    return INITIAL_PRODUCTS;
  });

  const [lastOrderData, setLastOrderData] = useState<{
    summaryText: string;
    total: number;
    customer: CustomerInfo;
  } | null>(null);

  // Cart State (Persisted in localStorage)
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('falcons_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('falcons_cart', JSON.stringify(cart));
    } catch {
      // ignore
    }
  }, [cart]);

  // Deep linking handling on mount
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const elementId = hash.replace('#', '');
      const el = document.getElementById(elementId);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth' });
        }, 300);
      }
    }
  }, []);

  // Scroll Spy to keep category tabs synchronized as the user scrolls
  useEffect(() => {
    if (searchQuery) return;

    let isThrottled = false;
    const handleScroll = () => {
      if (isThrottled) return;
      isThrottled = true;
      setTimeout(() => {
        isThrottled = false;
      }, 100);

      const headerOffset = 180;
      const scrollPos = window.scrollY + headerOffset;

      for (let i = CATEGORIES.length - 1; i >= 0; i--) {
        const cat = CATEGORIES[i];
        const el = document.getElementById(`cat-${cat.id}`);
        if (el) {
          const top = el.offsetTop;
          if (scrollPos >= top) {
            setActiveCategory(cat.id);
            const tabBtn = document.getElementById(`cat-tab-${cat.id}`);
            const strip = tabBtn?.parentElement;
            if (tabBtn && strip) {
              const scrollLeft = tabBtn.offsetLeft - (strip.clientWidth / 2) + (tabBtn.clientWidth / 2);
              strip.scrollTo({ left: scrollLeft, behavior: 'smooth' });
            }
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [searchQuery]);

  const handleSaveProducts = (updatedProducts: Product[]) => {
    setProducts(updatedProducts);
    try {
      localStorage.setItem('falcons_custom_products', JSON.stringify(updatedProducts));
    } catch (e) {
      console.error('Error persisting products to localStorage', e);
    }
  };

  const handleSelectCategory = (categoryId: ProductCategory) => {
    setActiveCategory(categoryId);
    setSearchQuery('');
    const el = document.getElementById(`cat-${categoryId}`);
    if (el) {
      const navEl = document.querySelector('nav.sticky');
      const offset = navEl ? navEl.getBoundingClientRect().height + 70 : 140;
      const targetPos = el.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({
        top: Math.max(0, targetPos),
        behavior: 'smooth'
      });
    }
    const tabBtn = document.getElementById(`cat-tab-${categoryId}`);
    const strip = tabBtn?.parentElement;
    if (tabBtn && strip) {
      const scrollLeft = tabBtn.offsetLeft - (strip.clientWidth / 2) + (tabBtn.clientWidth / 2);
      strip.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }
  };

  const handleOpenProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsCustomizerOpen(true);
  };

  const handleQuickAddFromName = (name: string) => {
    const found = products.find((p) => p.name.toLowerCase().includes(name.toLowerCase()));
    if (found) {
      handleOpenProduct(found);
    } else {
      const first = products[0];
      handleOpenProduct(first);
    }
  };

  const handleAddToCart = (customizedItem: {
    product: Product;
    qty: number;
    variant?: string | null;
    sauces: SelectedSauceItem[];
    onion?: 'Sofrita' | 'Cruda' | 'Sin cebolla' | null;
    upsells: SelectedUpsellItem[];
    specialNotes: string;
    unitPrice: number;
  }) => {
    const newCartItem: CartItem = {
      cartItemId: `${customizedItem.product.id}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      product: customizedItem.product,
      qty: customizedItem.qty,
      variant: customizedItem.variant || null,
      sauces: customizedItem.sauces,
      onion: customizedItem.onion,
      upsells: customizedItem.upsells,
      specialNotes: customizedItem.specialNotes,
      unitPrice: customizedItem.unitPrice
    };

    setCart((prev) => [...prev, newCartItem]);
  };

  const handleUpdateQty = (cartItemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.cartItemId === cartItemId) {
            const newQty = item.qty + delta;
            return newQty > 0 ? { ...item, qty: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveItem = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleOrderSuccess = (orderData: { summaryText: string; total: number; customer: CustomerInfo }) => {
    setLastOrderData(orderData);
    setIsCartOpen(false);
    setIsSuccessOpen(true);
    setCart([]);
  };

  // Filtered products for search
  const filteredProducts = searchQuery.trim()
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : null;

  const totalCartCount = cart.reduce((acc, item) => acc + item.qty, 0);
  const totalCartPrice = cart.reduce((acc, item) => acc + item.unitPrice * item.qty, 0);
  const formatMoney = (amount: number) => '$' + amount.toLocaleString('es-CO');

  return (
    <div className="min-h-[100dvh] min-h-screen w-full bg-[#0A0A0A] text-white flex flex-col selection:bg-[#E53E3E] selection:text-white overflow-x-hidden">
      {/* Sticky Header */}
      <Header
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenQR={() => setIsQROpen(true)}
        onOpenInfo={() => setIsInfoOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* 3D Hero Viewer Experience */}
      <Hero3DViewer onQuickAddProduct={handleQuickAddFromName} />

      {/* Sticky Category Tabs + Search */}
      <CategoryTabs
        categories={CATEGORIES}
        activeCategory={activeCategory}
        onSelectCategory={handleSelectCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main Menu Catalog Section */}
      <main id="menu" className="max-w-4xl mx-auto px-4 pt-6 pb-[calc(env(safe-area-inset-bottom,0px)+7rem)] space-y-10 flex-1 w-full">
        {/* Search Results Mode */}
        {filteredProducts ? (
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <h2 className="font-display text-2xl font-bold tracking-wide text-amber-400 uppercase">
                Resultados para "{searchQuery}"
              </h2>
              <span className="text-xs text-neutral-400 font-semibold">
                {filteredProducts.length} productos encontrados
              </span>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-12 bg-neutral-900/40 rounded-3xl border border-neutral-800/60 p-6 space-y-3">
                <p className="text-neutral-400 text-sm">
                  No encontramos ningún producto que coincida con "{searchQuery}".
                </p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all"
                >
                  Ver todo el menú
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} onSelect={handleOpenProduct} />
                ))}
              </div>
            )}
          </section>
        ) : (
          /* Standard Categorized Catalog */
          CATEGORIES.map((cat) => {
            const catProducts = products.filter((p) => p.category === cat.id);
            if (catProducts.length === 0) return null;

            return (
              <section
                key={cat.id}
                id={`cat-${cat.id}`}
                className="scroll-mt-36 space-y-3.5"
              >
                {/* Category Header Title */}
                <div className="flex items-center justify-between border-b border-neutral-800/80 pb-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{cat.icon}</span>
                    <div>
                      <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-wide text-amber-400 uppercase leading-none">
                        {cat.name}
                      </h2>
                      <p className="text-[11px] text-neutral-400 hidden sm:block mt-0.5">
                        {cat.description}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-neutral-500 font-semibold shrink-0">
                    {catProducts.length} opciones
                  </span>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {catProducts.map((product) => (
                    <ProductCard key={product.id} product={product} onSelect={handleOpenProduct} />
                  ))}
                </div>
              </section>
            );
          })
        )}
      </main>

      {/* FLOATING CART BAR (Bottom Sticky for High Conversion) */}
      {totalCartCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 p-4 pb-[calc(env(safe-area-inset-bottom,0px)+1rem)] bg-gradient-to-t from-black via-black/95 to-transparent pointer-events-none animate-in slide-in-from-bottom duration-300 transform-gpu">
          <div className="max-w-4xl mx-auto pointer-events-auto">
            <button
              id="floating-cart-cta"
              onClick={() => setIsCartOpen(true)}
              className="w-full bg-gradient-to-r from-[#E53E3E] via-red-600 to-[#E53E3E] hover:from-red-600 hover:to-[#E53E3E] text-white p-3.5 sm:p-4 rounded-2xl font-bold flex items-center justify-between shadow-2xl shadow-red-600/50 border border-red-500/40 transition-all active:scale-[0.99] group"
            >
              <div className="flex items-center gap-3">
                <span className="bg-black/50 text-amber-400 text-xs font-extrabold px-3 py-1 rounded-xl border border-amber-400/30 flex items-center gap-1">
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>{totalCartCount} ITEMS</span>
                </span>
                <span className="text-xs sm:text-sm font-extrabold tracking-wider uppercase text-white">
                  Ver mi Pedido
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-display text-xl sm:text-2xl font-bold tracking-wider text-white">
                  {formatMoney(totalCartPrice)}
                </span>
                <ChevronRight className="w-5 h-5 text-white/80 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Modals & Drawers */}
      <ProductCustomizerModal
        product={selectedProduct}
        isOpen={isCustomizerOpen}
        onClose={() => {
          setIsCustomizerOpen(false);
          setSelectedProduct(null);
        }}
        onAddToCart={handleAddToCart}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        onOrderSuccess={handleOrderSuccess}
      />

      <QRCodeModal
        isOpen={isQROpen}
        onClose={() => setIsQROpen(false)}
      />

      <StoreInfoModal
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
      />

      <OrderSuccessModal
        isOpen={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
        orderData={lastOrderData}
      />

      <AdminCMSModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        products={products}
        onSaveProducts={handleSaveProducts}
      />

      {/* Footer */}
      <footer className="bg-neutral-950 border-t border-neutral-800/80 py-8 px-4 text-neutral-400 text-xs mt-auto">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="font-display text-xl font-bold text-white uppercase tracking-wider">
                Falcon's Alitas
              </span>
              <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full border border-red-500/30 font-bold">
                OFICIAL
              </span>
            </div>
            <p className="text-[11px] text-neutral-400">
              Calle 48D Sur N. 55C - 04, San Antonio de Prado, Medellín.
            </p>
            <p className="text-[10px] text-neutral-400">
              Envíos a todo San Antonio de Prado e Itagüí.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs flex-wrap justify-center sm:justify-end">
            <a
              href="https://search.google.com/local/writereview?placeid=ChIJNfenHViBRo4RkHjghosd4M0"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 font-bold hover:underline flex items-center gap-1"
            >
              <span>⭐ Calificar 5★</span>
            </a>
            <button
              onClick={() => setIsQROpen(true)}
              className="text-neutral-300 hover:text-amber-400 transition-colors"
            >
              Código QR
            </button>
            <button
              onClick={() => setIsInfoOpen(true)}
              className="text-neutral-300 hover:text-white transition-colors"
            >
              Horarios & Pagos
            </button>
            <button
              onClick={() => setIsAdminOpen(true)}
              className="text-neutral-400 hover:text-amber-400 transition-colors flex items-center gap-1"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin CMS</span>
            </button>
            <a
              href="https://wa.me/573193574825"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 font-bold hover:underline"
            >
              WhatsApp: 319 357 4825
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
