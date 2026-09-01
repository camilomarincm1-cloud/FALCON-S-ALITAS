import { CategoryInfo, Product, UpsellOption, NeighborhoodDelivery } from '../types';

export const CATEGORIES: CategoryInfo[] = [
  { id: 'papas', name: 'Papas & Salchipapas', icon: '🍟', description: 'Porciones cargadas con salchichas, queso, huevo de codorniz y molipollo' },
  { id: 'combos', name: 'Combos & Alitas', icon: '🍗', description: 'Nuestras famosas alitas doradas, bombones crocantes y combos familiares' },
  { id: 'hamburguesas', name: 'Hamburguesas', icon: '🍔', description: 'Carnes 100% artesanales, tocineta crocante, ripio y queso fundido' },
  { id: 'chuzos', name: 'Chuzos & Carnes', icon: '🥩', description: 'Chuzos al carbón con papas a la francesa, arepa frita y ensalada' },
  { id: 'arepas', name: 'Arepas & Patacón', icon: '🫓', description: 'Arepas fritas rellenas y patacones con carnes desmechadas y queso' },
  { id: 'perros', name: 'Perros & Perras', icon: '🌭', description: 'Con longaniza paisa, tocineta, huevitos de codorniz, ripio y salsas' },
  { id: 'adiciones', name: 'Adiciones & Extras', icon: '➕', description: 'Personaliza tu plato con porciones e ingredientes extra' },
  { id: 'bebidas', name: 'Bebidas Frías', icon: '🥤', description: 'Gaseosas, cervezas nacionales, jugos Hit y agua helada' }
];

export const AVAILABLE_SAUCES: string[] = [
  'Rosada Falcon',
  'Piña Dulce',
  'BBQ Ahumada',
  'Ajo Cremoso',
  'Maíz Tierno',
  'Tártara de la Casa',
  'Roja Especial',
  'Mostaza Miel',
  'Picante Suave'
];

export const UPSELL_OPTIONS: UpsellOption[] = [
  { id: 'u1', name: 'Tocineta Extra Crocante', price: 3500 },
  { id: 'u2', name: 'Doble Queso Mozzarella Fundido', price: 2500 },
  { 
    id: 'u3', 
    name: 'Gaseosa Personal 400ml Helada', 
    price: 3500,
    label: 'Elige tu Gaseosa Personal 400ml:',
    variants: ['Coca-Cola 400ml', 'Postobón Manzana', 'Colombiana 400ml', 'Cuatro Toronja', 'Sprite 400ml', 'Pony Malta 400ml']
  },
  { 
    id: 'u4', 
    name: 'Gaseosa 1.5L Familiar', 
    price: 7000,
    label: 'Elige tu Gaseosa 1.5L:',
    variants: ['Coca-Cola 1.5L', 'Postobón Manzana 1.5L', 'Colombiana 1.5L', 'Cuatro 1.5L']
  },
  { id: 'u5', name: 'Porción Extra Papas Fritas', price: 4500 },
  { id: 'u6', name: 'Huevitos de Codorniz x3', price: 2000 },
  { 
    id: 'u7', 
    name: 'Salsa Extra en Bolsita', 
    price: 500,
    label: 'Elige el Sabor de la Salsa Extra:',
    variants: ['Ajo Cremoso', 'BBQ Ahumada', 'Piña Dulce', 'Maíz Tierno', 'Rosada Falcon', 'Tártara de la Casa', 'Roja Especial', 'Mostaza Miel', 'Picante Suave']
  }
];

export const PRODUCTS: Product[] = [
  // ==========================================
  // PAPAS & SALCHIPAPAS MEDELLÍN CALLEJERAS
  // ==========================================
  {
    id: 1,
    category: 'papas',
    name: 'Salchipapa Especial Paisa',
    price: 15000,
    description: 'Bandeja cargada de papas a la francesa crujientes, salchichas rancheras doradas, chorizo cóctel, huevo de codorniz, torta molipollo y lluvia de queso costeño y salsas.',
    badge: 'MÁS VENDIDO 🔥',
    popular: true,
    prepTime: '12-15 min',
    imageEmoji: '🍟',
    image: '/images/salchipapa_especial.jpg'
  },
  {
    id: 2,
    category: 'papas',
    name: 'Choripapas Falcon',
    price: 15000,
    description: 'Papas doradas estilo Medellín, 5 chorizos cóctel sellados a la plancha, huevo de codorniz, tortica molipollo y baño de salsa rosada y tártara casera.',
    badge: 'RECOMENDADO ⭐',
    popular: true,
    prepTime: '12-15 min',
    imageEmoji: '🌭',
    image: '/images/choripapas.jpg'
  },
  {
    id: 3,
    category: 'papas',
    name: 'Porción de Papas Clásica',
    price: 12000,
    description: 'Cesta generosa de papas a la francesa bien crujientes con salchicha dorada o torta molipollo y salsas servidas al gusto.',
    prepTime: '10-12 min',
    imageEmoji: '🍟',
    image: '/images/porcion_papas.jpg'
  },
  {
    id: 4,
    category: 'papas',
    name: 'Papas Mechas Desgranadas',
    price: 22000,
    description: 'Papas fritas estilo chuzo desgranado cubiertas con abundante carne o pollo desmechado en guiso criollo, tocineta picada, maicitos tiernos y queso gratinado derretido.',
    badge: 'ESPECIAL CHEF 👑',
    popular: true,
    prepTime: '15-18 min',
    imageEmoji: '🧀',
    image: '/images/papas_mechas.jpg'
  },
  {
    id: 5,
    category: 'papas',
    name: 'Picada Longaniza Tradicional',
    price: 16000,
    description: 'Longaniza campesina asada a la plancha, papas fritas, arepa redonda frita dorada, tajada de queso blanco y ensalada fresca con salsa rosada.',
    prepTime: '15 min',
    imageEmoji: '🥩',
    image: '/images/picada_longaniza.jpg'
  },

  // ==========================================
  // COMBOS & ALITAS FALCON'S
  // ==========================================
  {
    id: 6,
    category: 'combos',
    name: 'Combo Bombón Express',
    price: 15000,
    description: 'Papas a la francesa sazonadas, 1 bombón de pollo con apanado crujiente dorado, 1 tortica molipollo y arepa frita campesina con salsas.',
    prepTime: '12-15 min',
    imageEmoji: '🍗',
    image: '/images/combo_bombon.jpg'
  },
  {
    id: 7,
    category: 'combos',
    name: 'Combo 1 Falcon Duo',
    price: 19000,
    description: 'Papas fritas, 1 bombón de pollo jugoso, 1 alita crujiente dorada, 2 torticas molipollo y arepa frita tradicional antioqueña.',
    badge: 'TOP COMBO ⚡',
    popular: true,
    prepTime: '15 min',
    imageEmoji: '🍗',
    image: '/images/combo_1.jpg'
  },
  {
    id: 8,
    category: 'combos',
    name: 'Combo 2 Falcon Master',
    price: 27000,
    description: 'Papas fritas tamaño doble, 2 bombones de pollo crocantes, 2 alitas bañadas en salsa BBQ o miel mostaza, 2 torticas molipollo y arepas fritas.',
    badge: 'DOBLE SABOR 🍗',
    popular: true,
    prepTime: '15-20 min',
    imageEmoji: '🍗',
    image: '/images/combo_2.jpg'
  },
  {
    id: 9,
    category: 'combos',
    name: 'Combo Familiar Falcon Fest',
    price: 41000,
    description: 'Mega bandeja familiar: Gran porción de papas a la francesa, 2 bombones, 2 alitas crocantes, 2 torticas molipollo, arepas fritas y Gaseosa 1.5L helada.',
    badge: 'FAMILIAR ⭐',
    popular: true,
    prepTime: '18-22 min',
    imageEmoji: '🎉',
    image: '/images/combo_familiar.jpg'
  },
  {
    id: 10,
    category: 'combos',
    name: 'Combo Butifarra Costeña',
    price: 15000,
    description: 'Papas doradas a la francesa con 4 butifarras asadas a la plancha/parrilla, limón fresco criollo y arepa frita dorada.',
    prepTime: '10-12 min',
    imageEmoji: '🍢',
    image: '/images/butifarra.jpg'
  },
  {
    id: 11,
    category: 'combos',
    name: 'Combo Tortas Molipollo (x4)',
    price: 15000,
    description: 'Cesta de papas crujientes con 4 torticas molipollo recién fritas y doradas, acompañadas de arepa frita y salsas al gusto.',
    prepTime: '10-12 min',
    imageEmoji: '🥠',
    image: '/images/combo_tortas.jpg'
  },

  // ==========================================
  // HAMBURGUESAS ESTILO CALLEJERO MEDELLÍN
  // ==========================================
  {
    id: 12,
    category: 'hamburguesas',
    name: 'Hamburguesa Gourmet Falcon',
    price: 21000,
    description: 'Carne artesanal gruesa a la plancha, tocineta ahumada crocante, jamón, doble queso mozzarella derretido, ripio de papa, lechuga, tomate y salsa tártara en pan brioche.',
    badge: 'ESTRELLA DE LA CASA 🌟',
    popular: true,
    prepTime: '15-18 min',
    imageEmoji: '🍔',
    image: '/images/hamburguesa_gourmet.jpg'
  },
  {
    id: 13,
    category: 'hamburguesas',
    name: 'Hamburguesa Carne Desmechada',
    price: 20000,
    description: 'Carne de res desmechada jugosa en hogao criollo, tocineta crujiente, jamón, queso derretido, maicitos desgranados, ripio de papa, lechuga y tomate.',
    badge: 'NUEVA RECETA 🥩',
    popular: true,
    prepTime: '15-18 min',
    imageEmoji: '🍔',
    image: '/images/hamburguesa_desmechada.jpg'
  },
  {
    id: 14,
    category: 'hamburguesas',
    name: 'Hamburguesa Especial Paisa',
    price: 19000,
    description: 'Carne jugosa de res a la plancha, tocineta crocante, jamón seleccionado, queso fundido, ripio de papa crujiente, lechuga y rodajas de tomate fresco.',
    prepTime: '14-16 min',
    imageEmoji: '🍔',
    image: '/images/hamburguesa_especial_paisa.jpg'
  },
  {
    id: 15,
    category: 'hamburguesas',
    name: 'Hamburguesa Sencilla Callejera',
    price: 15000,
    description: 'Carne a la plancha con queso derretido, ripio de papa crocante, lechuga, tomate y salsa rosada de la casa.',
    prepTime: '12-14 min',
    imageEmoji: '🍔',
    image: '/images/hamburguesa_sencilla_callejera.jpg'
  },

  // ==========================================
  // CHUZOS & CARNES AL CARBÓN / PLANCHA
  // ==========================================
  {
    id: 16,
    category: 'chuzos',
    name: 'Chuzo de Pollo Callejero',
    price: 24000,
    description: 'Chuzo grande con trozos marinados de pechuga de pollo asados al fuego, servido con papas a la francesa, arepa frita con queso campesino y ensalada de repollo y zanahoria.',
    badge: 'FAVORITO 🍢',
    popular: true,
    prepTime: '18-20 min',
    imageEmoji: '🍢',
    image: '/images/chuzo_pollo.jpg'
  },
  {
    id: 17,
    category: 'chuzos',
    name: 'Chuzo de Cerdo Parrillero',
    price: 22000,
    description: 'Chuzo de lomo de cerdo tierno y dorado a la parrilla, con papas a la francesa, arepa frita con queso campesino y ensalada agridulce.',
    prepTime: '18-20 min',
    imageEmoji: '🍢',
    image: '/images/chuzo_cerdo.jpg'
  },
  {
    id: 18,
    category: 'chuzos',
    name: 'Churrasco al Carbón',
    price: 29000,
    description: 'Corte de carne de res jugoso sellado en plancha caliente, acompañado de generosa porción de papas a la francesa, arepa frita dorada, queso y ensalada.',
    badge: 'PREMIUM CUT 🥩',
    popular: true,
    prepTime: '20-25 min',
    imageEmoji: '🥩',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=700&q=80'
  },
  {
    id: 19,
    category: 'chuzos',
    name: 'Carne de Cerdo a la Plancha',
    price: 25000,
    description: 'Filete jugoso de lomo de cerdo sazonado a la plancha, servido con papas a la francesa, arepa frita con queso blanco y ensalada fresca.',
    prepTime: '18 min',
    imageEmoji: '🥩',
    image: '/images/cerdo_plancha.jpg'
  },
  {
    id: 20,
    category: 'chuzos',
    name: 'Pechuga a la Plancha Dorada',
    price: 25000,
    description: 'Filete grande de pechuga de pollo dorado a la plancha con finas hierbas, papas fritas crujientes, arepa frita, queso y ensalada de la casa.',
    prepTime: '16-18 min',
    imageEmoji: '🍗',
    image: '/images/pechuga_plancha.jpg'
  },

  // ==========================================
  // AREPAS RELLENAS & PATACONES CALLEJEROS
  // ==========================================
  {
    id: 21,
    category: 'arepas',
    name: 'Arepa Rellena Falcon Supreme',
    price: 22000,
    description: 'Arepa antioqueña frita y tostada abierta y rebosante de carne desmechada, tocineta, maicitos, chicharroncitos crocantes, queso mozzarella fundido y guacamole criollo.',
    badge: 'SUPER RELLENA 🥑',
    popular: true,
    prepTime: '15-18 min',
    imageEmoji: '🫓',
    image: '/images/arepa_rellena.jpg'
  },
  {
    id: 22,
    category: 'arepas',
    name: 'Arepa Mechas (Carne o Pollo)',
    price: 18000,
    description: 'Arepa dorada asada abierta y rellena a elegir de abundante y jugoso pollo desmechado o carne mechada criolla.',
    badge: 'A ELECCIÓN 🥩🍗',
    popular: true,
    prepTime: '14-16 min',
    imageEmoji: '🫓',
    image: '/images/arepa_mechas.jpg'
  },
  {
    id: 23,
    category: 'arepas',
    name: 'Arepa con Todo Paisa',
    price: 18000,
    description: 'Arepa paisa asada al carbón rellena y rebosante de carne desmechada, trocitos de chicharrón, plátano maduro, tocineta y queso derretido.',
    prepTime: '14-16 min',
    imageEmoji: '🫓',
    image: '/images/arepa_paisa.jpg'
  },
  {
    id: 24,
    category: 'arepas',
    name: 'Patacón Pisao con Mechas',
    price: 20000,
    description: 'Patacón gigante de plátano verde tostado y crocante, cargado con abundante y jugosa carne o pollo desmechado al estilo criollo.',
    badge: 'CRUJIENTE 🍌',
    popular: true,
    prepTime: '15-18 min',
    imageEmoji: '🍌',
    image: '/images/patacon.jpg'
  },

  // ==========================================
  // PERROS & PERRAS CALLEJERAS MEDELLÍN
  // ==========================================
  {
    id: 25,
    category: 'perros',
    name: 'Perra Especial Falcon (Sin Salchicha)',
    price: 19000,
    description: 'La clásica perra paisa: abundante tocineta crocante, longaniza picada, doble queso mozzarella derretido, 3 huevitos de codorniz, ripio de papa y salsa rosada y piña en pan caliente.',
    badge: 'TOP PICADA 🌭',
    popular: true,
    prepTime: '12-15 min',
    imageEmoji: '🌭',
    image: 'https://images.unsplash.com/photo-1619740455993-9e612b1af08a?auto=format&fit=crop&w=700&q=80'
  },
  {
    id: 26,
    category: 'perros',
    name: 'Perro Especial con Longaniza',
    price: 18000,
    description: 'Longaniza parrillera a la plancha, tocineta crujiente, queso mozzarella fundido, huevito de codorniz, ripio de papa y salsas de la casa en pan suave.',
    prepTime: '12-14 min',
    imageEmoji: '🌭',
    image: '/images/perro_longaniza.jpg'
  },
  {
    id: 27,
    category: 'perros',
    name: 'Perrito Callejero Tradicional',
    price: 9000,
    description: 'Salchicha tradicional en pan suave con ajonjolí, queso derretido, abundante ripio crocante de papa y bañado en salsas clásicas.',
    prepTime: '8-10 min',
    imageEmoji: '🌭',
    image: '/images/perro_callejero.jpg'
  },

  // ==========================================
  // ADICIONES & EXTRAS
  // ==========================================
  {
    id: 28,
    category: 'adiciones',
    name: 'Bombón o Alita Individual',
    price: 3500,
    description: 'Porción individual extra de bombón o alita con apanado dorado, bañada en tu salsa favorita.',
    prepTime: '5 min',
    imageEmoji: '🍗',
    image: '/images/bombon_alita.jpg'
  },
  {
    id: 29,
    category: 'adiciones',
    name: 'Tocineta Extra Crocante',
    price: 3500,
    description: 'Tiras de tocineta ahumada fritas en su punto bien tostado.',
    prepTime: '3 min',
    imageEmoji: '🥓',
    image: 'https://images.unsplash.com/photo-1528607929212-2636ec44253e?auto=format&fit=crop&w=700&q=80'
  },
  {
    id: 30,
    category: 'adiciones',
    name: 'Queso Mozzarella Fundido Extra',
    price: 2500,
    description: 'Generosa porción de queso fundido elástico y cremoso para bañar tus alitas o papas.',
    prepTime: '2 min',
    imageEmoji: '🧀',
    image: '/images/queso_fundido.jpg'
  },
  {
    id: 31,
    category: 'adiciones',
    name: 'Porción Salchichas Extra',
    price: 2500,
    description: 'Generosa porción de salchichas en rodajas doradas a la plancha.',
    prepTime: '4 min',
    imageEmoji: '🌭',
    image: '/images/salchichas_extra.jpg'
  },
  {
    id: 32,
    category: 'adiciones',
    name: 'Chorizo Coctelero (x2)',
    price: 1500,
    description: '2 unidades de chorizos cóctel dorados y jugosos sellados al calor.',
    prepTime: '4 min',
    imageEmoji: '🍖',
    image: '/images/chorizo_coctelero.jpg'
  },
  {
    id: 33,
    category: 'adiciones',
    name: 'Butifarra Costeña (Unidad)',
    price: 1300,
    description: 'Unidad de butifarra asada a la parrilla con limón.',
    prepTime: '3 min',
    imageEmoji: '🍢',
    image: '/images/butifarra.jpg'
  },
  {
    id: 34,
    category: 'adiciones',
    name: 'Torta Molipollo (Unidad)',
    price: 1300,
    description: 'Tortica clásica de molipollo dorada y crocante con salsa de la casa.',
    prepTime: '3 min',
    imageEmoji: '🥠',
    image: '/images/torta_molipollo.jpg'
  },
  {
    id: 35,
    category: 'adiciones',
    name: 'Salsas en Bolsita Extra',
    price: 500,
    description: 'Bolsita sellada de salsa artesanal fresca preparada en casa: Ajo, Tártara, Rosada, Maíz, Piña, BBQ o Picante.',
    prepTime: '1 min',
    imageEmoji: '🥣',
    image: '/images/salsas_bolsa.jpg'
  },

  // ==========================================
  // BEBIDAS FRÍAS
  // ==========================================
  {
    id: 36,
    category: 'bebidas',
    name: 'Gaseosa 1.5 Litros Mega',
    price: 7000,
    description: 'Postobón Manzana, Colombiana, Coca-Cola o Cuatro Toronja helada para compartir.',
    prepTime: '1 min',
    imageEmoji: '🍾',
    image: '/images/gaseosas.jpg'
  },
  {
    id: 37,
    category: 'bebidas',
    name: 'Hit de Caja / Cerveza Nacional',
    price: 5000,
    description: 'Cerveza Nacional bien helada (Águila Original, Águila Light, Pilsen, Andina) o Jugo Hit de caja (Mango, Mora, Lulo).',
    prepTime: '1 min',
    imageEmoji: '🍺',
    image: '/images/cervezas.jpg'
  },
  {
    id: 38,
    category: 'bebidas',
    name: 'Gaseosa Personal / Malta / Vive100 / Té',
    price: 3500,
    description: 'Botella de vidrio 400ml o lata fría: Coca-Cola, Manzana, Colombiana, Cuatro, Sprite, Pony Malta, Vive 100 o Mr. Tea (Limón / Durazno).',
    prepTime: '1 min',
    imageEmoji: '🥤',
    image: '/images/bebidas_personales.jpg'
  },
  {
    id: 39,
    category: 'bebidas',
    name: 'Gaseosa Mini / Pony Malta Mini',
    price: 2500,
    description: 'Botellas de vidrio mini bien frías: Coca-Cola Mini, Postobón Manzana, Colombiana, Cuatro o Pony Malta Mini.',
    prepTime: '1 min',
    imageEmoji: '🥤',
    image: '/images/gaseosas_mini.jpg'
  },
  {
    id: 40,
    category: 'bebidas',
    name: 'Agua Cristal Personal (600ml)',
    price: 2000,
    description: 'Botella de vidrio de 600ml de Agua Cristal purificada sin gas, bien helada y refrescante.',
    prepTime: '1 min',
    imageEmoji: '💧',
    image: '/images/agua_cristal.jpg'
  }
];

export const SAN_ANTONIO_NEIGHBORHOODS: NeighborhoodDelivery[] = [
  { name: 'El Rosario (San Antonio de Prado)', fee: 4000, estimatedMinutes: '25-35 min' },
  { name: 'Centro / Parque Principal Prado', fee: 3500, estimatedMinutes: '20-30 min' },
  { name: 'Pradito', fee: 4000, estimatedMinutes: '25-35 min' },
  { name: 'Barichara', fee: 4500, estimatedMinutes: '30-40 min' },
  { name: 'El Limonar 1 y 2', fee: 4500, estimatedMinutes: '30-40 min' },
  { name: 'Los Naranjos', fee: 4000, estimatedMinutes: '25-35 min' },
  { name: 'La Verde', fee: 5000, estimatedMinutes: '35-45 min' },
  { name: 'Santa Rita / San José', fee: 4500, estimatedMinutes: '30-40 min' },
  { name: 'Potrerito', fee: 5500, estimatedMinutes: '35-45 min' },
  { name: 'La Rosaleda / Vergel', fee: 4500, estimatedMinutes: '30-40 min' },
  { name: 'La Florida / Montañita', fee: 5000, estimatedMinutes: '35-45 min' },
  { name: 'La Oculta / El Triana', fee: 5500, estimatedMinutes: '35-45 min' },
  { name: 'Itagüí (Calatrava / Ditaires / San Gabriel)', fee: 7000, estimatedMinutes: '40-50 min' },
  { name: 'Otro Sector en Prado (Especificar en dirección)', fee: 4500, estimatedMinutes: '30-40 min' },
  { name: 'Recoger en Sede (Calle 48D Sur N. 55C - 04)', fee: 0, estimatedMinutes: '15-25 min' },
  { name: 'En Mesa (Consumo en Local)', fee: 0, estimatedMinutes: '10-20 min' }
];

export const PROMO_CODES: Record<string, { discountPercent?: number; fixedDiscount?: number; description: string }> = {
  'FALCONS10': { discountPercent: 10, description: '10% de Descuento de Bienvenida' },
  'ALITASVIP': { fixedDiscount: 3000, description: '$3.000 Descuento en tu pedido' },
  'PRADOFEST': { discountPercent: 15, description: '15% de Descuento especial Prado' }
};
