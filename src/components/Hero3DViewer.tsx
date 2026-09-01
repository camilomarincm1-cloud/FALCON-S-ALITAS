import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Sparkles, Eye, Flame, Award, ChevronRight, Star, ThumbsUp } from 'lucide-react';
import { Product } from '../types';

interface Hero3DViewerProps {
  onQuickAddProduct: (productName: string) => void;
}

type ModelType = 'burger' | 'wings' | 'salchipapa';

export const Hero3DViewer: React.FC<Hero3DViewerProps> = ({ onQuickAddProduct }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeModel, setActiveModel] = useState<ModelType>('burger');
  const [activeHotspot, setActiveHotspot] = useState<number | null>(0);
  const [isRotating, setIsRotating] = useState(true);

  const hotspots = [
    {
      id: 0,
      title: 'Carne 100% Artesanal 180g',
      desc: 'Sellada al punto exacto con sazón especial Falcon',
      position: 'top-10 left-6 sm:left-12',
      tag: 'CALIDAD'
    },
    {
      id: 1,
      title: 'Tocineta Ahumada & Doble Queso',
      desc: 'Queso fundido gratinado y tocineta ultra crujiente',
      position: 'bottom-20 left-4 sm:left-10',
      tag: 'PREMIUM'
    },
    {
      id: 2,
      title: 'Salsas Artesanales Gratis (x3)',
      desc: 'Rosada, BBQ Ahumada, Ajo, Piña, Tártara y más',
      position: 'top-16 right-4 sm:right-12',
      tag: 'EL FAVORITO'
    }
  ];

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let animationFrameId: number;
    const width = container.clientWidth || 380;
    const height = container.clientHeight || 340;

    // Scene
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0a0a, 0.08);

    // Camera
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 1.2, 4.2);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.replaceChildren(renderer.domElement);

    // 3-Point Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffeedd, 1.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff5ea, 3.5);
    keyLight.position.set(3, 5, 4);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xe53e3e, 2.0); // Brand Red accent
    fillLight.position.set(-4, 2, -2);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xd69e2e, 3.0); // Brand Gold warm rim
    rimLight.position.set(0, 4, -4);
    scene.add(rimLight);

    const floorLight = new THREE.PointLight(0xffaa44, 1.0, 6);
    floorLight.position.set(0, -1, 0);
    scene.add(floorLight);

    // Pedestal Plate / Floor Shadow Disc
    const plateGeo = new THREE.CylinderGeometry(1.6, 1.4, 0.08, 48);
    const plateMat = new THREE.MeshStandardMaterial({
      color: 0x181818,
      metalness: 0.8,
      roughness: 0.25,
    });
    const plate = new THREE.Mesh(plateGeo, plateMat);
    plate.position.y = -0.85;
    plate.receiveShadow = true;
    scene.add(plate);

    // Group for Food Model
    const foodGroup = new THREE.Group();
    scene.add(foodGroup);

    // BUILD PROCEDURAL PBR MODELS
    const materialsToDispose: THREE.Material[] = [plateMat];
    const geometriesToDispose: THREE.BufferGeometry[] = [plateGeo];

    const buildBurger = () => {
      // Bun Bottom
      const bunMat = new THREE.MeshStandardMaterial({ color: 0xd9822b, roughness: 0.5, metalness: 0.05 });
      const bunGeo = new THREE.CylinderGeometry(1.1, 0.95, 0.35, 36);
      const bunBottom = new THREE.Mesh(bunGeo, bunMat);
      bunBottom.position.y = -0.6;
      bunBottom.castShadow = true;
      bunBottom.receiveShadow = true;
      foodGroup.add(bunBottom);
      materialsToDispose.push(bunMat);
      geometriesToDispose.push(bunGeo);

      // Sauce Layer bottom
      const sauceMat = new THREE.MeshStandardMaterial({ color: 0xcc2222, roughness: 0.1, metalness: 0.2 });
      const sauceGeo = new THREE.CylinderGeometry(1.05, 1.08, 0.08, 32);
      const sauceBottom = new THREE.Mesh(sauceGeo, sauceMat);
      sauceBottom.position.y = -0.4;
      foodGroup.add(sauceBottom);
      materialsToDispose.push(sauceMat);
      geometriesToDispose.push(sauceGeo);

      // Meat Patty
      const meatMat = new THREE.MeshStandardMaterial({ color: 0x3d2012, roughness: 0.85, metalness: 0.1 });
      const meatGeo = new THREE.CylinderGeometry(1.15, 1.15, 0.35, 36);
      const meat = new THREE.Mesh(meatGeo, meatMat);
      meat.position.y = -0.22;
      meat.castShadow = true;
      foodGroup.add(meat);
      materialsToDispose.push(meatMat);
      geometriesToDispose.push(meatGeo);

      // Melted Cheese (with dripping corners)
      const cheeseMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3, metalness: 0.1 });
      const cheeseGeo = new THREE.BoxGeometry(1.4, 0.08, 1.4);
      const cheese = new THREE.Mesh(cheeseGeo, cheeseMat);
      cheese.position.y = -0.02;
      cheese.rotation.y = Math.PI / 4;
      cheese.castShadow = true;
      foodGroup.add(cheese);
      materialsToDispose.push(cheeseMat);
      geometriesToDispose.push(cheeseGeo);

      // Bacon Strips (x2)
      const baconMat = new THREE.MeshStandardMaterial({ color: 0x8b1a10, roughness: 0.4, metalness: 0.1 });
      const baconGeo = new THREE.BoxGeometry(1.5, 0.05, 0.4);
      const bacon1 = new THREE.Mesh(baconGeo, baconMat);
      bacon1.position.set(0, 0.06, 0.2);
      bacon1.rotation.y = 0.2;
      foodGroup.add(bacon1);

      const bacon2 = new THREE.Mesh(baconGeo, baconMat);
      bacon2.position.set(0, 0.06, -0.2);
      bacon2.rotation.y = -0.3;
      foodGroup.add(bacon2);
      materialsToDispose.push(baconMat);
      geometriesToDispose.push(baconGeo);

      // Fresh Green Lettuce
      const lettuceMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.6, metalness: 0.0 });
      const lettuceGeo = new THREE.TorusGeometry(0.85, 0.25, 16, 32);
      const lettuce = new THREE.Mesh(lettuceGeo, lettuceMat);
      lettuce.rotation.x = Math.PI / 2;
      lettuce.position.y = 0.16;
      lettuce.scale.set(1.2, 1.2, 0.3);
      foodGroup.add(lettuce);
      materialsToDispose.push(lettuceMat);
      geometriesToDispose.push(lettuceGeo);

      // Red Tomato Slices
      const tomatoMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.2, metalness: 0.1 });
      const tomatoGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.08, 24);
      const tomato1 = new THREE.Mesh(tomatoGeo, tomatoMat);
      tomato1.position.set(-0.35, 0.26, 0.15);
      tomato1.rotation.z = 0.05;
      foodGroup.add(tomato1);

      const tomato2 = new THREE.Mesh(tomatoGeo, tomatoMat);
      tomato2.position.set(0.35, 0.26, -0.15);
      tomato2.rotation.z = -0.05;
      foodGroup.add(tomato2);
      materialsToDispose.push(tomatoMat);
      geometriesToDispose.push(tomatoGeo);

      // Top Brioche Bun
      const topBunGeo = new THREE.SphereGeometry(1.15, 36, 24, 0, Math.PI * 2, 0, Math.PI / 2);
      const topBun = new THREE.Mesh(topBunGeo, bunMat);
      topBun.position.y = 0.32;
      topBun.scale.set(1, 0.65, 1);
      topBun.castShadow = true;
      foodGroup.add(topBun);
      geometriesToDispose.push(topBunGeo);

      // Sesame seeds on top
      const seedMat = new THREE.MeshStandardMaterial({ color: 0xffedd5, roughness: 0.6 });
      const seedGeo = new THREE.SphereGeometry(0.025, 8, 8);
      materialsToDispose.push(seedMat);
      geometriesToDispose.push(seedGeo);

      for (let i = 0; i < 30; i++) {
        const seed = new THREE.Mesh(seedGeo, seedMat);
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * 0.9;
        const r = 1.13;
        seed.position.set(
          r * Math.sin(phi) * Math.cos(theta),
          0.32 + r * Math.cos(phi) * 0.65,
          r * Math.sin(phi) * Math.sin(theta)
        );
        seed.scale.set(1, 0.4, 2);
        seed.lookAt(0, 0.32, 0);
        foodGroup.add(seed);
      }
    };

    const buildWings = () => {
      const wingMat = new THREE.MeshStandardMaterial({
        color: 0x994d11,
        roughness: 0.35,
        metalness: 0.15
      });
      materialsToDispose.push(wingMat);

      // 4 Golden Wings arranged in dynamic circle
      for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI) / 2 + 0.3;
        const wingGroup = new THREE.Group();

        const drumGeo = new THREE.CylinderGeometry(0.22, 0.12, 0.8, 16);
        const drum = new THREE.Mesh(drumGeo, wingMat);
        drum.castShadow = true;
        geometriesToDispose.push(drumGeo);

        const jointGeo = new THREE.SphereGeometry(0.24, 16, 16);
        const joint = new THREE.Mesh(jointGeo, wingMat);
        joint.position.y = 0.35;
        geometriesToDispose.push(jointGeo);

        wingGroup.add(drum);
        wingGroup.add(joint);

        wingGroup.position.set(Math.cos(angle) * 0.7, -0.3, Math.sin(angle) * 0.7);
        wingGroup.rotation.set(0.6, angle, -0.4);
        foodGroup.add(wingGroup);
      }

      // Dipping Sauce Cup in the center
      const cupMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.2, metalness: 0.8 });
      const cupGeo = new THREE.CylinderGeometry(0.4, 0.3, 0.4, 24);
      const cup = new THREE.Mesh(cupGeo, cupMat);
      cup.position.y = -0.55;
      foodGroup.add(cup);
      materialsToDispose.push(cupMat);
      geometriesToDispose.push(cupGeo);

      // Sauce Dip inside
      const dipMat = new THREE.MeshStandardMaterial({ color: 0xe53e3e, roughness: 0.1, metalness: 0.2 });
      const dipGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.05, 24);
      const dip = new THREE.Mesh(dipGeo, dipMat);
      dip.position.y = -0.38;
      foodGroup.add(dip);
      materialsToDispose.push(dipMat);
      geometriesToDispose.push(dipGeo);

      // Fries surround
      const fryMat = new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.5 });
      const fryGeo = new THREE.BoxGeometry(0.1, 0.8, 0.1);
      materialsToDispose.push(fryMat);
      geometriesToDispose.push(fryGeo);

      for (let j = 0; j < 18; j++) {
        const fry = new THREE.Mesh(fryGeo, fryMat);
        const fAngle = (j / 18) * Math.PI * 2;
        fry.position.set(Math.cos(fAngle) * 1.0, -0.65, Math.sin(fAngle) * 1.0);
        fry.rotation.set(Math.random() * 0.4, fAngle, Math.random() * 0.4);
        foodGroup.add(fry);
      }
    };

    const buildSalchipapa = () => {
      const fryMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.4 });
      const fryGeo = new THREE.BoxGeometry(0.12, 0.9, 0.12);
      materialsToDispose.push(fryMat);
      geometriesToDispose.push(fryGeo);

      // Mound of Fries
      for (let i = 0; i < 28; i++) {
        const fry = new THREE.Mesh(fryGeo, fryMat);
        const radius = Math.random() * 0.8;
        const ang = Math.random() * Math.PI * 2;
        fry.position.set(Math.cos(ang) * radius, -0.6 + Math.random() * 0.3, Math.sin(ang) * radius);
        fry.rotation.set(Math.random() * 1.2 - 0.6, Math.random() * Math.PI, Math.random() * 1.2 - 0.6);
        foodGroup.add(fry);
      }

      // Sausages sliced (Pink/Reddish)
      const sausageMat = new THREE.MeshStandardMaterial({ color: 0xbe123c, roughness: 0.3 });
      const sausageGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.25, 16);
      materialsToDispose.push(sausageMat);
      geometriesToDispose.push(sausageGeo);

      for (let s = 0; s < 12; s++) {
        const sausage = new THREE.Mesh(sausageGeo, sausageMat);
        const sRad = Math.random() * 0.75;
        const sAng = Math.random() * Math.PI * 2;
        sausage.position.set(Math.cos(sAng) * sRad, -0.3 + Math.random() * 0.35, Math.sin(sAng) * sRad);
        sausage.rotation.set(Math.random() * 1.5, Math.random() * 1.5, Math.random() * 1.5);
        foodGroup.add(sausage);
      }

      // Molipollo Cake / Egg on top
      const eggMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
      const eggGeo = new THREE.SphereGeometry(0.24, 16, 16);
      const egg = new THREE.Mesh(eggGeo, eggMat);
      egg.position.set(0, 0.2, 0);
      foodGroup.add(egg);
      materialsToDispose.push(eggMat);
      geometriesToDispose.push(eggGeo);

      // Cheese Drizzles
      const cheeseMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.2 });
      const cheeseTorusGeo = new THREE.TorusGeometry(0.6, 0.08, 8, 24);
      const cheeseTorus = new THREE.Mesh(cheeseTorusGeo, cheeseMat);
      cheeseTorus.position.y = -0.05;
      cheeseTorus.rotation.x = Math.PI / 2.2;
      foodGroup.add(cheeseTorus);
      materialsToDispose.push(cheeseMat);
      geometriesToDispose.push(cheeseTorusGeo);
    };

    if (activeModel === 'burger') buildBurger();
    else if (activeModel === 'wings') buildWings();
    else buildSalchipapa();

    // Mouse Interaction
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      foodGroup.rotation.y += deltaX * 0.008;
      foodGroup.rotation.x = Math.max(-0.4, Math.min(0.4, foodGroup.rotation.x + deltaY * 0.005));

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    container.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    // Animation Loop
    let clock = new THREE.Clock();
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      if (isRotating && !isDragging) {
        foodGroup.rotation.y += 0.008;
        foodGroup.position.y = Math.sin(elapsedTime * 1.5) * 0.04;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      container.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);

      // Clean disposal to prevent memory leaks and keep 60fps
      geometriesToDispose.forEach(g => g.dispose());
      materialsToDispose.forEach(m => m.dispose());
      renderer.dispose();
    };
  }, [activeModel, isRotating]);

  const getActiveProductName = () => {
    switch (activeModel) {
      case 'burger': return 'Hamburguesa Gourmet Falcon';
      case 'wings': return 'Combo 2 Falcon Master';
      case 'salchipapa': return 'Salchipapa Especial';
    }
  };

  return (
    <section id="hero-3d" className="relative w-full overflow-hidden bg-gradient-to-b from-neutral-950 via-[#0e0e0e] to-neutral-950 border-b border-neutral-800/80 pt-4 pb-6">
      {/* Background Ambience Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-72 h-72 bg-gradient-to-br from-brand-red/15 via-brand-gold/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4">
        {/* Top Badges & Selector */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <a
              href="https://search.google.com/local/writereview?placeid=ChIJNfenHViBRo4RkHjghosd4M0"
              target="_blank"
              rel="noopener noreferrer"
              title="Calificar en Google Maps"
              className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500/20 via-red-500/20 to-amber-500/20 hover:from-amber-500/30 hover:to-amber-500/30 text-amber-300 border border-amber-500/40 px-3 py-1 rounded-full text-xs font-extrabold tracking-wide uppercase transition-all group cursor-pointer"
            >
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 group-hover:scale-110 transition-transform" />
              <span>⭐ ¡Califica tu experiencia y pide fácil en 1 minuto!</span>
            </a>
            <span className="text-[11px] text-neutral-300 hidden sm:inline-flex items-center gap-1">
              <ThumbsUp className="w-3 h-3 text-emerald-400" /> Salsas artesanales gratis
            </span>
          </div>

          {/* Model Switcher Pills */}
          <div className="flex items-center gap-1.5 bg-neutral-900/90 p-1 rounded-2xl border border-neutral-800 shadow-inner">
            <button
              id="model-btn-burger"
              onClick={() => setActiveModel('burger')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeModel === 'burger'
                  ? 'bg-brand-red text-white shadow-lg shadow-brand-red/30'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <span>🍔</span>
              <span>Gourmet</span>
            </button>
            <button
              id="model-btn-wings"
              onClick={() => setActiveModel('wings')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeModel === 'wings'
                  ? 'bg-brand-red text-white shadow-lg shadow-brand-red/30'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <span>🍗</span>
              <span>Alitas Master</span>
            </button>
            <button
              id="model-btn-salchipapa"
              onClick={() => setActiveModel('salchipapa')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeModel === 'salchipapa'
                  ? 'bg-brand-red text-white shadow-lg shadow-brand-red/30'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <span>🍟</span>
              <span>Salchipapa</span>
            </button>
          </div>
        </div>

        {/* 3D Canvas Container */}
        <div className="relative w-full h-[320px] sm:h-[360px] rounded-3xl bg-neutral-900/30 border border-neutral-800/60 shadow-2xl flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing touch-pan-y">
          <div ref={containerRef} className="w-full h-full touch-pan-y" />

          {/* Interactive Hotspot Pills (Overlaid) */}
          {hotspots.map((spot) => (
            <div
              key={spot.id}
              className={`absolute ${spot.position} transition-all z-10`}
            >
              <button
                id={`hotspot-btn-${spot.id}`}
                onClick={() => setActiveHotspot(activeHotspot === spot.id ? null : spot.id)}
                className="group relative flex items-center gap-1.5 bg-black/80 hover:bg-black backdrop-blur-md border border-brand-gold/40 hover:border-brand-gold text-white px-2.5 py-1.5 rounded-2xl shadow-xl transition-all"
              >
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-gold opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-gold"></span>
                </span>
                <span className="text-[11px] font-bold text-neutral-200 group-hover:text-brand-goldLight transition-colors">
                  {spot.tag}
                </span>
              </button>

              {activeHotspot === spot.id && (
                <div className="mt-1.5 bg-neutral-950/95 border border-brand-gold/30 rounded-xl p-2.5 shadow-2xl max-w-[200px] backdrop-blur-lg animate-in fade-in zoom-in-95 duration-200">
                  <p className="text-xs font-bold text-white leading-tight">{spot.title}</p>
                  <p className="text-[10px] text-neutral-400 mt-1 leading-snug">{spot.desc}</p>
                </div>
              )}
            </div>
          ))}

          {/* Bottom Floating Action inside 3D Card */}
          <div className="absolute bottom-3 right-3 sm:right-4 z-10 flex items-center gap-2">
            <button
              id="toggle-rotation-btn"
              onClick={() => setIsRotating(!isRotating)}
              className="bg-black/70 hover:bg-black text-neutral-300 hover:text-white px-2.5 py-1.5 rounded-xl text-[11px] font-semibold border border-neutral-700 backdrop-blur-md transition-colors"
            >
              {isRotating ? '⏸ Pausar Giro' : '▶ Girar'}
            </button>
            <button
              id="cta-order-3d"
              onClick={() => onQuickAddProduct(getActiveProductName())}
              className="bg-gradient-to-r from-brand-red to-red-600 hover:from-red-600 hover:to-brand-red text-white text-xs font-extrabold px-3.5 py-2 rounded-xl shadow-lg shadow-brand-red/40 border border-red-400/30 flex items-center gap-1.5 transition-all transform active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>Pedir este Plato</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
