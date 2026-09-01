import React, { useState, useRef } from 'react';
import { Product, ProductCategory } from '../types';
import { CATEGORIES, PRODUCTS as DEFAULT_PRODUCTS } from '../data/menuData';
import { verifyAdminCredentials, sanitizeText, sanitizeMoney, MAX_LENGTHS } from '../utils/security';
import { 
  X, 
  Lock, 
  Save, 
  RotateCcw, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  Image as ImageIcon, 
  DollarSign, 
  Tag, 
  Upload, 
  Loader2, 
  Sparkles,
  Camera
} from 'lucide-react';

interface AdminCMSModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSaveProducts: (updatedProducts: Product[]) => void;
}

export const AdminCMSModal: React.FC<AdminCMSModalProps> = ({
  isOpen,
  onClose,
  products,
  onSaveProducts
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const token = sessionStorage.getItem('falcon_admin_token');
      return Boolean(token && token.length > 10);
    } catch {
      return false;
    }
  });

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [editableProducts, setEditableProducts] = useState<Product[]>(() => products);
  const [saveToast, setSaveToast] = useState(false);
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  // Hidden file inputs refs per product
  const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});

  // Sync if products change externally
  React.useEffect(() => {
    setEditableProducts(products);
  }, [products, isOpen]);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setAuthError('');

    try {
      const result = await verifyAdminCredentials(username, password);
      if (result.success && result.token) {
        setIsAuthenticated(true);
        try {
          sessionStorage.setItem('falcon_admin_token', result.token);
        } catch {}
        setPassword('');
        setAuthError('');
      } else {
        setAuthError(result.message || 'Credenciales incorrectas. Verifica usuario y contraseña.');
      }
    } catch {
      setAuthError('Error de red durante la autenticación segura.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    try {
      sessionStorage.removeItem('falcon_admin_token');
    } catch {}
  };

  const handleFieldChange = (id: number, field: keyof Product, value: any) => {
    let sanitizedVal = value;
    if (field === 'price') {
      sanitizedVal = sanitizeMoney(value);
    } else if (field === 'name') {
      sanitizedVal = sanitizeText(value, 80);
    } else if (field === 'description') {
      sanitizedVal = sanitizeText(value, 200);
    }
    setEditableProducts((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return { ...item, [field]: sanitizedVal };
        }
        return item;
      })
    );
  };

  /**
   * Helper function: Compresses image client-side to ensure maximum performance & instant CDN load
   */
  const compressImage = (file: File, maxWidth = 900, maxHeight = 900, quality = 0.85): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          let { width, height } = img;
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', quality));
          } else {
            resolve(event.target?.result as string);
          }
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  /**
   * Async Cloud & Local Uploader Handler
   */
  const handleImageFileUpload = async (productId: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido (JPG, PNG, WebP).');
      return;
    }

    try {
      setUploadingId(productId);
      setUploadStatus('Optimizando y subiendo...');

      // 1. First compress client-side
      const compressedDataUrl = await compressImage(file);

      let finalPublicUrl = compressedDataUrl;

      // 2. Attempt backend cloud upload endpoint if available (Vercel Serverless / Cloudinary / Vercel Blob)
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('productId', productId.toString());

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          if (data.url) {
            // Append cache busting parameter
            finalPublicUrl = `${data.url}?v=${Date.now()}`;
          }
        }
      } catch (backendError) {
        console.warn('API cloud upload endpoint not active, using ultra-optimized direct storage:', backendError);
      }

      // 3. Update state reactively
      handleFieldChange(productId, 'image', finalPublicUrl);
      setUploadStatus('¡Imagen cargada!');
      setTimeout(() => setUploadStatus(null), 2500);
    } catch (error) {
      console.error('Error subiendo imagen:', error);
      alert('Hubo un problema al procesar la imagen.');
    } finally {
      setUploadingId(null);
      // Reset input value
      if (e.target) e.target.value = '';
    }
  };

  const handleSave = () => {
    onSaveProducts(editableProducts);
    setSaveToast(true);
    setTimeout(() => {
      setSaveToast(false);
    }, 3000);
  };

  const handleResetToFactory = () => {
    if (window.confirm('¿Deseas restablecer todos los precios e imágenes del menú a los valores oficiales de fábrica?')) {
      setEditableProducts(DEFAULT_PRODUCTS);
      onSaveProducts(DEFAULT_PRODUCTS);
      setSaveToast(true);
      setTimeout(() => {
        setSaveToast(false);
      }, 3000);
    }
  };

  const filtered = editableProducts.filter((p) => {
    const matchCat = categoryFilter === 'all' || p.category === categoryFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 transform-gpu">
      {!isAuthenticated ? (
        /* Login Screen */
        <div className="bg-[#121212] w-full max-w-md rounded-3xl border border-neutral-800 p-6 sm:p-7 shadow-2xl space-y-5 relative overflow-hidden animate-in zoom-in-95 duration-200 transform-gpu">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-[#E53E3E] to-red-500" />

          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display text-2xl font-bold text-white uppercase tracking-wide leading-none">
                  Acceso Administrador
                </h3>
                <p className="text-xs text-neutral-400 mt-1">Panel de control de precios y catálogo en vivo</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-white p-1 rounded-lg bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {authError && (
              <div className="p-3 bg-red-950/60 border border-red-500/40 rounded-xl text-xs text-red-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider block">Usuario</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Usuario administrador (ej: admin)"
                required
                className="w-full bg-neutral-900 border border-neutral-800 focus:border-amber-500 rounded-xl p-3 text-sm text-white placeholder-neutral-500 outline-none transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider block">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full bg-neutral-900 border border-neutral-800 focus:border-amber-500 rounded-xl p-3 text-sm text-white placeholder-neutral-500 outline-none transition-colors"
              />
              <span className="text-[10px] text-neutral-500 block">Acceso exclusivo para el personal autorizado del restaurante.</span>
            </div>

            <button
              type="submit"
              disabled={isVerifying}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-black font-extrabold py-3.5 px-4 rounded-xl text-sm uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verificando Credenciales...</span>
                </>
              ) : (
                <span>⚡ Iniciar Sesión en CMS</span>
              )}
            </button>
          </form>
        </div>
      ) : (
        /* CMS Admin Panel */
        <div className="bg-[#101010] w-full max-w-4xl rounded-3xl border border-neutral-800 max-h-[92dvh] flex flex-col shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200 transform-gpu">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-neutral-800 bg-neutral-900/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold">
                ⚡
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-white uppercase tracking-wide leading-none">
                    Panel de Administración CMS
                  </h3>
                  <span className="bg-amber-500/20 text-amber-400 text-[10px] font-extrabold px-2 py-0.5 rounded-md border border-amber-500/30 uppercase">
                    EN VIVO
                  </span>
                </div>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Edita precios, sube fotos a la nube y personaliza etiquetas en tiempo real
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={handleSave}
                className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl transition-all shadow-md flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Guardar Cambios</span>
              </button>
              <button
                onClick={handleLogout}
                className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold px-3 py-2 rounded-xl border border-neutral-700 transition-colors"
              >
                Cerrar Sesión
              </button>
              <button
                onClick={onClose}
                className="text-neutral-400 hover:text-white p-2 rounded-xl bg-neutral-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Toast Notification */}
          {saveToast && (
            <div className="bg-emerald-900/90 border-b border-emerald-500/40 text-emerald-200 px-4 py-2.5 text-xs font-bold flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>¡Cambios guardados con éxito! El menú se ha actualizado en tiempo real.</span>
              </span>
              <span className="text-[10px] text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded">Persistido</span>
            </div>
          )}

          {uploadStatus && (
            <div className="bg-amber-950/90 border-b border-amber-500/40 text-amber-200 px-4 py-2 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
              <span>{uploadStatus}</span>
            </div>
          )}

          {/* Filters Bar */}
          <div className="p-3 sm:p-4 bg-neutral-950/80 border-b border-neutral-800 flex flex-col sm:flex-row gap-2.5 sm:items-center justify-between">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar plato en CMS..."
                  className="w-full bg-neutral-900 border border-neutral-800 focus:border-amber-500 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-neutral-500 outline-none"
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-neutral-900 border border-neutral-800 text-neutral-300 text-xs rounded-xl px-2.5 py-2 outline-none focus:border-amber-500"
              >
                <option value="all">Todas las categorías</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleResetToFactory}
                className="text-[11px] bg-red-950/60 hover:bg-red-900 text-red-300 font-semibold px-3 py-2 rounded-xl border border-red-500/30 transition-colors flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restablecer Fábrica</span>
              </button>
            </div>
          </div>

          {/* Product Items List */}
          <div className="p-3 sm:p-5 overflow-y-auto space-y-3.5 flex-1 max-h-[60vh] hide-scrollbar">
            {filtered.map((prod) => (
              <div
                key={prod.id}
                className="bg-neutral-900/90 rounded-2xl border border-neutral-800/90 p-3 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3.5 hover:border-neutral-700 transition-colors"
              >
                {/* Visual Thumbnail with Interactive File Upload Overlay */}
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div className="relative group w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-neutral-950 border border-neutral-800 shrink-0 overflow-hidden flex items-center justify-center shadow-inner">
                    {prod.image ? (
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1562967914-608f82629710?w=600&auto=format&fit=crop&q=80';
                        }}
                      />
                    ) : (
                      <span className="text-2xl">{prod.imageEmoji || '🍗'}</span>
                    )}

                    {/* Upload Spinner if Active */}
                    {uploadingId === prod.id ? (
                      <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-amber-400 gap-1 z-10">
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <span className="text-[8px] font-bold uppercase tracking-wider">Subiendo</span>
                      </div>
                    ) : (
                      /* Quick Hover Trigger to Open File Picker */
                      <button
                        type="button"
                        onClick={() => fileInputRefs.current[prod.id]?.click()}
                        title="Cambiar foto de este plato"
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-1 cursor-pointer"
                      >
                        <Camera className="w-5 h-5 text-amber-400" />
                        <span className="text-[8px] font-extrabold uppercase tracking-wider">Subir</span>
                      </button>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] text-neutral-500 font-bold uppercase">
                        #{prod.id} • {prod.category}
                      </span>
                      {prod.badge && (
                        <span className="text-[9px] bg-red-900/30 text-red-300 font-bold px-1.5 py-0.2 rounded border border-red-500/40">
                          {prod.badge}
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-white text-sm sm:text-base leading-snug">
                      {prod.name}
                    </h4>
                    <p className="text-[11px] text-neutral-400 line-clamp-1 mt-0.5">
                      {prod.description}
                    </p>
                  </div>
                </div>

                {/* Editable Fields: Price, Image File Selector, and Badge */}
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-800">
                  {/* Price */}
                  <div className="w-28 sm:w-32">
                    <label className="text-[9px] text-neutral-400 uppercase font-bold tracking-wider block mb-0.5">
                      Precio (COP)
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-2.5 flex items-center text-xs font-bold text-neutral-400">
                        $
                      </span>
                      <input
                        type="number"
                        value={prod.price}
                        step={500}
                        min={0}
                        onChange={(e) => handleFieldChange(prod.id, 'price', Number(e.target.value) || 0)}
                        className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 text-amber-300 font-extrabold text-xs sm:text-sm rounded-xl pl-6 pr-2 py-1.5 outline-none"
                      />
                    </div>
                  </div>

                  {/* Cloud File Selector + Visual Trigger */}
                  <div className="w-44 sm:w-52">
                    <label className="text-[9px] text-neutral-400 uppercase font-bold tracking-wider block mb-0.5">
                      Foto / Nube
                    </label>
                    
                    {/* Hidden Native File Input */}
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/webp, image/jpg"
                      ref={(el) => (fileInputRefs.current[prod.id] = el)}
                      onChange={(e) => handleImageFileUpload(prod.id, e)}
                      className="hidden"
                    />

                    {/* Styled Cloud Upload Trigger Button */}
                    <button
                      type="button"
                      onClick={() => fileInputRefs.current[prod.id]?.click()}
                      disabled={uploadingId === prod.id}
                      className="w-full bg-neutral-950 hover:bg-neutral-800 active:scale-[0.98] border border-neutral-700 hover:border-amber-500 text-neutral-200 text-xs font-semibold rounded-xl px-3 py-1.5 transition-all flex items-center justify-between gap-2 shadow-sm"
                    >
                      <div className="flex items-center gap-1.5 min-w-0 truncate">
                        {uploadingId === prod.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400 shrink-0" />
                        ) : (
                          <Upload className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        )}
                        <span className="truncate text-[11px]">
                          {uploadingId === prod.id ? 'Subiendo...' : 'Subir Archivo'}
                        </span>
                      </div>
                      <span className="text-[9px] bg-neutral-800 text-neutral-400 px-1.5 py-0.5 rounded font-mono">
                        PNG/JPG
                      </span>
                    </button>
                  </div>

                  {/* Badge */}
                  <div className="w-32 sm:w-36">
                    <label className="text-[9px] text-neutral-400 uppercase font-bold tracking-wider block mb-0.5">
                      Badge / Etiqueta
                    </label>
                    <input
                      type="text"
                      value={prod.badge || ''}
                      onChange={(e) => handleFieldChange(prod.id, 'badge', e.target.value)}
                      placeholder="Ej: MÁS VENDIDO 🔥"
                      className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 text-neutral-200 text-xs rounded-xl px-2 py-1.5 outline-none"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="p-3 sm:p-4 bg-neutral-900 border-t border-neutral-800 flex items-center justify-between">
            <span className="text-xs text-neutral-400 font-medium">
              Total de <span className="text-white font-bold">{editableProducts.length}</span> platos configurados
            </span>
            <button
              onClick={handleSave}
              className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-green-900/30 flex items-center gap-2 active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>Guardar y Aplicar al Menú</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
