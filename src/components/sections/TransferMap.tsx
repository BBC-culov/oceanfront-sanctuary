import { useRef, useEffect, useState, useCallback } from "react";
import { motion, useInView } from "framer-motion";
import { mainRoute, branchUp, branchDown, branchLeft, planePath, islandPath, coastDetails, terrainLines, secondaryRoads, localities, beaches, vegetation } from "./transferMapData";

const TransferMap = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(mapRef, { once: true, margin: "0px 0px -100px 0px" });
  const [animRef, setAnimRef] = useState<SVGAnimateMotionElement | null>(null);
  const [animRefUp, setAnimRefUp] = useState<SVGAnimateMotionElement | null>(null);
  const [animRefDown, setAnimRefDown] = useState<SVGAnimateMotionElement | null>(null);
  const [animRefLeft, setAnimRefLeft] = useState<SVGAnimateMotionElement | null>(null);
  const [planeRef, setPlaneRef] = useState<SVGAnimateMotionElement | null>(null);
  const [splitVisible, setSplitVisible] = useState(false);
  const [dotsVisible, setDotsVisible] = useState(false);
  const [splashes, setSplashes] = useState<{id: number; x: number; y: number}[]>([]);
  const [hoveredCar, setHoveredCar] = useState<string | null>(null);
  const splashIdRef = useRef(0);

  const animCallbackRef = useCallback((node: SVGAnimateMotionElement | null) => { setAnimRef(node); }, []);
  const animCallbackRefUp = useCallback((node: SVGAnimateMotionElement | null) => { setAnimRefUp(node); }, []);
  const animCallbackRefDown = useCallback((node: SVGAnimateMotionElement | null) => { setAnimRefDown(node); }, []);
  const animCallbackRefLeft = useCallback((node: SVGAnimateMotionElement | null) => { setAnimRefLeft(node); }, []);
  const planeCallbackRef = useCallback((node: SVGAnimateMotionElement | null) => { setPlaneRef(node); }, []);


  // Plane arrives first, then main car starts
  useEffect(() => {
    if (isInView && planeRef) {
      const t = setTimeout(() => {
        try { planeRef.beginElement(); } catch (e) { /* */ }
      }, 600);
      return () => clearTimeout(t);
    }
  }, [isInView, planeRef]);

  useEffect(() => {
    if (isInView && animRef) {
      const timer = setTimeout(() => {
        try { animRef.beginElement(); } catch (e) { /* */ }
      }, 3200);
      const splitTimer = setTimeout(() => { setSplitVisible(true); }, 5700);
      const dotsTimer = setTimeout(() => { setDotsVisible(true); }, 6800);
      return () => { clearTimeout(timer); clearTimeout(splitTimer); clearTimeout(dotsTimer); };
    }
  }, [isInView, animRef]);

  useEffect(() => {
    if (splitVisible) {
      const t1 = setTimeout(() => { try { animRefUp?.beginElement(); } catch (e) { /* */ } }, 100);
      const t2 = setTimeout(() => { try { animRefDown?.beginElement(); } catch (e) { /* */ } }, 100);
      const t3 = setTimeout(() => { try { animRefLeft?.beginElement(); } catch (e) { /* */ } }, 100);
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }
  }, [splitVisible, animRefUp, animRefDown, animRefLeft]);

  const handleOceanClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgPt = pt.matrixTransform(svg.getScreenCTM()?.inverse());
    // Only splash if clicking on ocean (not on island)
    const id = ++splashIdRef.current;
    setSplashes(prev => [...prev, { id, x: svgPt.x, y: svgPt.y }]);
    setTimeout(() => setSplashes(prev => prev.filter(s => s.id !== id)), 1200);
  };

  const SplashEffect = ({ x, y }: { x: number; y: number }) => (
    <g>
      {[0, 1, 2, 3, 4, 5].map(i => {
        const angle = (i / 6) * Math.PI * 2;
        const dx = Math.cos(angle) * 18;
        const dy = Math.sin(angle) * 12;
        return (
          <motion.circle key={i} cx={x} cy={y} r="1.5"
            fill="hsl(var(--ocean) / 0.5)"
            initial={{ cx: x, cy: y, opacity: 1, r: 1.5 }}
            animate={{ cx: x + dx, cy: y + dy, opacity: 0, r: 0.5 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.03 }}
          />
        );
      })}
      <motion.circle cx={x} cy={y} r="3" fill="none" stroke="hsl(var(--ocean) / 0.4)" strokeWidth="1"
        initial={{ r: 3, opacity: 0.8 }} animate={{ r: 22, opacity: 0 }} transition={{ duration: 0.8 }} />
      <motion.circle cx={x} cy={y} r="3" fill="none" stroke="hsl(var(--ocean) / 0.25)" strokeWidth="0.7"
        initial={{ r: 5, opacity: 0.6 }} animate={{ r: 30, opacity: 0 }} transition={{ duration: 1, delay: 0.1 }} />
    </g>
  );

  const CarShape = () => (
    <>
      <ellipse cx="0" cy="5" rx="8" ry="2.5" fill="hsl(var(--foreground) / 0.08)" />
      <rect x="-10" y="-6" width="20" height="12" rx="3.5" fill="hsl(var(--primary))" />
      <rect x="-7" y="-4" width="7" height="5" rx="1.2" fill="hsl(var(--ocean) / 0.4)" />
      <rect x="1" y="-4" width="5" height="5" rx="1.2" fill="hsl(var(--ocean) / 0.3)" />
      <circle cx="-6" cy="6" r="2" fill="hsl(var(--foreground) / 0.6)" />
      <circle cx="6" cy="6" r="2" fill="hsl(var(--foreground) / 0.6)" />
    </>
  );

  // Apartment destination dot
  const AptDot = ({ x, y, delay }: { x: number; y: number; delay: number }) => (
    <motion.g initial={{ opacity: 0, scale: 0 }} animate={dotsVisible ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.5, delay, type: "spring", stiffness: 300, damping: 15 }}>
      <motion.circle cx={x} cy={y} r="10" fill="none" stroke="hsl(var(--accent) / 0.35)" strokeWidth="1.5"
        initial={{ scale: 0.8, opacity: 0 }} animate={dotsVisible ? { scale: [0.8, 2.2], opacity: [1, 0] } : {}}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut", delay: delay + 0.5 }} />
      <circle cx={x} cy={y} r="8" fill="hsl(var(--primary) / 0.15)" stroke="hsl(var(--primary) / 0.3)" strokeWidth="1" />
      <circle cx={x} cy={y} r="5" fill="hsl(var(--primary))" />
      <circle cx={x} cy={y} r="2.5" fill="hsl(var(--accent))" />
      <circle cx={x - 1.5} cy={y - 1.5} r="1" fill="hsl(var(--primary-foreground) / 0.6)" />
    </motion.g>
  );

  return (
    <div ref={mapRef} className="relative w-full max-w-xl mx-auto lg:mx-0" style={{ perspective: "800px" }}>
      <motion.div
        initial={{ rotateX: 8, opacity: 0, y: 30 }}
        animate={isInView ? { rotateX: 4, opacity: 1, y: 0 } : { rotateX: 8, opacity: 0, y: 30 }}
        transition={{ duration: 1, ease: "easeOut" }}
        style={{ transformStyle: "preserve-3d" }}
      >
        <svg viewBox="0 0 500 380" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-xl cursor-pointer" onClick={handleOceanClick}>
          <defs>
            <radialGradient id="oceanGrad" cx="50%" cy="50%" r="60%">
              <stop offset="0%" stopColor="hsl(var(--ocean) / 0.08)" />
              <stop offset="100%" stopColor="hsl(var(--ocean) / 0.15)" />
            </radialGradient>
            <radialGradient id="islandGrad" cx="40%" cy="35%" r="55%">
              <stop offset="0%" stopColor="hsl(var(--sand-light))" />
              <stop offset="70%" stopColor="hsl(var(--sand))" />
              <stop offset="100%" stopColor="hsl(var(--sand) / 0.8)" />
            </radialGradient>
            <radialGradient id="mountainGrad" cx="50%" cy="40%" r="40%">
              <stop offset="0%" stopColor="hsl(var(--sand) / 0.6)" />
              <stop offset="100%" stopColor="hsl(var(--sand) / 0.2)" />
            </radialGradient>
            <filter id="islandShadow" x="-10%" y="-10%" width="130%" height="140%">
              <feDropShadow dx="3" dy="6" stdDeviation="8" floodColor="hsl(var(--foreground) / 0.12)" />
            </filter>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          <rect width="500" height="380" fill="url(#oceanGrad)" rx="8" />

          {/* Ocean waves */}
          {[0, 1, 2, 3].map((i) => (
            <motion.path key={`wave-${i}`}
              d={`M ${10 + i * 8} ${325 + i * 10} Q ${180 + i * 5} ${318 + i * 8}, ${350} ${322 + i * 6} Q ${420 - i * 5} ${328 + i * 4}, ${490 - i * 8} ${320 + i * 12}`}
              stroke="hsl(var(--ocean) / 0.10)" strokeWidth="0.8" fill="none"
              initial={{ pathLength: 0 }} animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
              transition={{ duration: 2, delay: 0.8 + i * 0.15 }} />
          ))}

          {/* === 3D SAILBOAT in the ocean === */}
          <motion.g
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ delay: 1.5, duration: 1 }}
          >
            {/* Gentle bobbing animation */}
            <animateTransform attributeName="transform" type="translate" values="0,0;0,-2;0,0;0,1;0,0" dur="4s" repeatCount="indefinite" />
            {/* Water reflection */}
            <ellipse cx="448" cy="310" rx="16" ry="3" fill="hsl(var(--ocean) / 0.12)" />
            {/* Hull - 3D */}
            <path d="M 434 302 L 440 308 L 456 308 L 462 302 Z" fill="hsl(20 60% 35%)" />
            <path d="M 440 308 L 456 308 L 458 305 L 442 305 Z" fill="hsl(20 50% 28%)" />
            {/* Mast */}
            <line x1="448" y1="308" x2="448" y2="278" stroke="hsl(20 40% 30%)" strokeWidth="1.2" />
            {/* Main sail - 3D with slight curve */}
            <path d="M 448 280 L 448 304 L 460 300 Z" fill="hsl(0 0% 95%)" />
            <path d="M 448 280 L 448 304 L 459 300 Z" fill="hsl(0 0% 88%)" />
            {/* Jib sail */}
            <path d="M 448 282 L 448 298 L 438 296 Z" fill="hsl(0 0% 92%)" />
            {/* Flag */}
            <path d="M 448 278 L 453 280 L 448 282" fill="hsl(var(--primary))" />
            {/* Wake lines */}
            <motion.path d="M 432 306 C 428 308, 424 308, 420 306" stroke="hsl(var(--ocean) / 0.2)" strokeWidth="0.6" fill="none"
              initial={{ pathLength: 0 }} animate={isInView ? { pathLength: 1 } : {}} transition={{ delay: 2, duration: 1 }} />
            <motion.path d="M 430 310 C 425 312, 419 312, 414 310" stroke="hsl(var(--ocean) / 0.15)" strokeWidth="0.5" fill="none"
              initial={{ pathLength: 0 }} animate={isInView ? { pathLength: 1 } : {}} transition={{ delay: 2.2, duration: 1 }} />
          </motion.g>

          {/* Reef edge */}
          <motion.path d={islandPath} fill="none" stroke="hsl(var(--ocean) / 0.12)" strokeWidth="14" strokeLinejoin="round"
            initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : { opacity: 0 }} transition={{ duration: 0.8, delay: 0.2 }} />

          {/* Island */}
          <motion.path d={islandPath} fill="url(#islandGrad)" filter="url(#islandShadow)"
            initial={{ scale: 0.9, opacity: 0 }} animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }} />

          {/* Coast details */}
          {coastDetails.map((d, i) => (
            <motion.path key={`coast-${i}`} d={d} stroke="hsl(var(--ocean) / 0.18)" strokeWidth="1.2" fill="none" strokeLinecap="round"
              initial={{ pathLength: 0 }} animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
              transition={{ duration: 1.2, delay: 0.4 + i * 0.1 }} />
          ))}

          {/* Terrain */}
          {terrainLines.map((d, i) => (
            <motion.path key={`terrain-${i}`} d={d} stroke={i >= 4 ? "hsl(var(--sand) / 0.55)" : "hsl(var(--sand) / 0.35)"} strokeWidth={i >= 4 ? "0.7" : "0.4"} fill="none"
              initial={{ pathLength: 0 }} animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
              transition={{ duration: 0.8, delay: 0.5 + i * 0.08 }} />
          ))}

          {/* Mountain */}
          <motion.ellipse cx="255" cy="205" rx="30" ry="18" fill="url(#mountainGrad)"
            initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : { opacity: 0 }} transition={{ delay: 0.6 }} />
          <motion.g initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : { opacity: 0 }} transition={{ delay: 0.8 }}>
            <text x="249" y="205" fontSize="9" className="select-none">⛰️</text>
            <text x="263" y="207" fontSize="5.5" fill="hsl(var(--muted-foreground) / 0.6)" fontFamily="var(--font-sans)" fontStyle="italic">387m</text>
          </motion.g>

          {/* Vegetation */}
          {vegetation.map((v, i) => (
            <motion.circle key={`veg-${i}`} cx={v.x} cy={v.y} r="3" fill="hsl(var(--sand) / 0.4)"
              initial={{ opacity: 0 }} animate={isInView ? { opacity: 0.6 } : { opacity: 0 }}
              transition={{ delay: 0.7 + i * 0.06 }} />
          ))}

          {/* Secondary roads */}
          {secondaryRoads.map((road, i) => (
            <motion.path key={`road-${i}`} d={road} stroke="hsl(var(--border))" strokeWidth="0.8" strokeDasharray="3 3" fill="none"
              initial={{ pathLength: 0 }} animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
              transition={{ duration: 1, delay: 0.4 + i * 0.08 }} />
          ))}

          {/* === PLANE FLIGHT PATH (dashed arc in sky) === */}
          <motion.path d={planePath} stroke="hsl(var(--foreground) / 0.06)" strokeWidth="1.5" strokeDasharray="4 4" fill="none"
            initial={{ pathLength: 0 }} animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
            transition={{ duration: 1.5, delay: 0.5 }} />

          {/* === VAPOR TRAIL behind plane === */}
          <motion.path d={planePath} stroke="hsl(var(--foreground) / 0.12)" strokeWidth="2.5" fill="none" strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }} animate={isInView ? { pathLength: 1, opacity: [0, 0.3, 0.15] } : {}}
            transition={{ duration: 2.5, delay: 0.6, ease: "easeInOut" }} />
          <motion.path d={planePath} stroke="hsl(var(--foreground) / 0.06)" strokeWidth="6" fill="none" strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }} animate={isInView ? { pathLength: 1, opacity: [0, 0.2, 0.05] } : {}}
            transition={{ duration: 2.5, delay: 0.7, ease: "easeInOut" }} />
          {/* Trail fade-out after plane lands */}
          <motion.path d={planePath} stroke="hsl(var(--foreground) / 0.08)" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeDasharray="2 6"
            initial={{ pathLength: 0, opacity: 0 }} animate={isInView ? { pathLength: 1, opacity: [0, 0.15, 0] } : {}}
            transition={{ duration: 3.5, delay: 0.8, ease: "easeOut" }} />

          {/* === MAIN ROAD === */}
          <motion.path d={mainRoute} stroke="hsl(var(--foreground) / 0.08)" strokeWidth="10" fill="none" strokeLinecap="round"
            initial={{ pathLength: 0 }} animate={isInView ? { pathLength: 1 } : { pathLength: 0 }} transition={{ duration: 1.5, delay: 0.3 }} />
          <motion.path d={mainRoute} stroke="hsl(var(--foreground) / 0.15)" strokeWidth="5" fill="none" strokeLinecap="round"
            initial={{ pathLength: 0 }} animate={isInView ? { pathLength: 1 } : { pathLength: 0 }} transition={{ duration: 1.5, delay: 0.3 }} />
          <path d={mainRoute} stroke="hsl(var(--primary-foreground) / 0.3)" strokeWidth="1" strokeDasharray="6 4" fill="none" />
          <motion.path d={mainRoute} stroke="hsl(var(--primary))" strokeWidth="3" fill="none" strokeLinecap="round"
            initial={{ pathLength: 0 }} animate={isInView ? { pathLength: 1 } : { pathLength: 0 }} transition={{ duration: 2, delay: 2.8, ease: "easeInOut" }} />

          {/* === BRANCH ROADS === */}
          {[branchUp, branchDown, branchLeft].map((path, i) => (
            <g key={`branch-road-${i}`}>
              <motion.path d={path} stroke="hsl(var(--foreground) / 0.08)" strokeWidth="8" fill="none" strokeLinecap="round"
                initial={{ pathLength: 0 }} animate={isInView ? { pathLength: 1 } : { pathLength: 0 }} transition={{ duration: 1.2, delay: 4.5 }} />
              <motion.path d={path} stroke="hsl(var(--foreground) / 0.12)" strokeWidth="4" fill="none" strokeLinecap="round"
                initial={{ pathLength: 0 }} animate={isInView ? { pathLength: 1 } : { pathLength: 0 }} transition={{ duration: 1.2, delay: 4.5 }} />
              <motion.path d={path} stroke="hsl(var(--primary) / 0.7)" strokeWidth="2.5" fill="none" strokeLinecap="round"
                initial={{ pathLength: 0 }} animate={isInView ? { pathLength: 1 } : { pathLength: 0 }} transition={{ duration: 1.5, delay: 5, ease: "easeInOut" }} />
            </g>
          ))}

          {/* Split point */}
          <motion.g initial={{ opacity: 0, scale: 0 }} animate={isInView ? { opacity: 1, scale: 1 } : {}} transition={{ delay: 5, type: "spring" }}>
            <circle cx="258" cy="158" r="5" fill="hsl(var(--primary) / 0.2)" />
            <circle cx="258" cy="158" r="2.5" fill="hsl(var(--primary))" />
          </motion.g>

          {/* Beach icons + names */}
          {beaches.map((b, i) => (
            <motion.g key={`beach-${i}`} initial={{ opacity: 0 }} animate={isInView ? { opacity: 0.85 } : { opacity: 0 }} transition={{ delay: 0.9 + i * 0.12 }}>
              <text x={b.x} y={b.y} fontSize="9" className="select-none">{b.icon}</text>
              <text x={b.x + 12} y={b.y + 3} fontSize="5.5" fill="hsl(var(--muted-foreground) / 0.7)" fontFamily="var(--font-sans)" fontStyle="italic">{b.name}</text>
            </motion.g>
          ))}

          {/* Locality labels */}
          {localities.map((loc, i) => (
            <motion.g key={`loc-${i}`} initial={{ opacity: 0, scale: 0 }} animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.6 + i * 0.1, type: "spring", stiffness: 200 }}>
              <circle cx={loc.x} cy={loc.y} r={loc.bold ? 3 : 2} fill={loc.bold ? "hsl(var(--foreground) / 0.5)" : "hsl(var(--foreground) / 0.3)"} />
              <text x={loc.x + 6} y={loc.y + 3} fontSize={loc.size} fill={loc.bold ? "hsl(var(--foreground) / 0.7)" : "hsl(var(--foreground) / 0.5)"}
                fontFamily="var(--font-sans)" fontWeight={loc.bold ? "600" : "400"}>{loc.name}</text>
            </motion.g>
          ))}

          {/* Airport */}
          <motion.g initial={{ opacity: 0, scale: 0 }} animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.8, type: "spring" }}>
            <motion.circle cx="138" cy="208" r="12" fill="none" stroke="hsl(var(--primary) / 0.3)" strokeWidth="1.5"
              initial={{ scale: 0.8, opacity: 1 }} animate={{ scale: 1.8, opacity: 0 }} transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }} />
            <circle cx="138" cy="208" r="9" fill="hsl(var(--primary))" />
            <circle cx="138" cy="208" r="4.5" fill="hsl(var(--primary-foreground))" />
            <text x="129" y="194" fontSize="14" className="select-none">✈️</text>
            <rect x="95" y="222" width="86" height="16" rx="3" fill="hsl(var(--primary))" />
            <text x="138" y="233" textAnchor="middle" fontSize="7.5" fill="hsl(var(--primary-foreground))" fontFamily="var(--font-sans)" fontWeight="600" letterSpacing="0.05em">
              Aeroporto BVC
            </text>
          </motion.g>

          {/* Apartment dots at destinations — appear when cars arrive */}
          <AptDot x={362} y={96} delay={0.2} />
          <AptDot x={368} y={232} delay={0.4} />
          <AptDot x={155} y={104} delay={0.6} />

          {/* === 3D PLANE (flies to airport) === */}
          <g>
            <animateMotion ref={planeCallbackRef} dur="2.5s" begin="indefinite" fill="freeze" path={planePath}
              keyPoints="0;1" keyTimes="0;1" calcMode="spline" keySplines="0.3 0 0.7 1" rotate="auto" />
            <ellipse cx="0" cy="10" rx="12" ry="3" fill="hsl(var(--foreground) / 0.06)" />
            <ellipse cx="0" cy="0" rx="14" ry="4" fill="hsl(var(--foreground) / 0.7)" />
            <ellipse cx="12" cy="0" rx="4" ry="2.5" fill="hsl(var(--ocean) / 0.5)" />
            <polygon points="-2,-3 -6,-14 2,-14 4,-3" fill="hsl(var(--foreground) / 0.55)" />
            <polygon points="-2,3 -6,14 2,14 4,3" fill="hsl(var(--foreground) / 0.55)" />
            <polygon points="-12,-2 -18,-10 -10,-2" fill="hsl(var(--foreground) / 0.5)" />
            <polygon points="-11,-1 -16,-6 -10,-6 -8,-1" fill="hsl(var(--foreground) / 0.4)" />
            <polygon points="-11,1 -16,6 -10,6 -8,1" fill="hsl(var(--foreground) / 0.4)" />
            <ellipse cx="0" cy="0" rx="14" ry="4" fill="none" stroke="hsl(var(--foreground) / 0.15)" strokeWidth="0.5" />
          </g>

          {/* === MAIN CAR (airport → split) === */}
          <g className="cursor-pointer" onMouseEnter={() => setHoveredCar('main')} onMouseLeave={() => setHoveredCar(null)}>
            <animateMotion ref={animCallbackRef} dur="2.5s" begin="indefinite" fill="freeze" path={mainRoute}
              keyPoints="0;1" keyTimes="0;1" calcMode="spline" keySplines="0.42 0 0.58 1" rotate="auto" />
            <CarShape />
            {hoveredCar === 'main' && (
              <>
                <motion.ellipse cx="0" cy="0" rx="16" ry="12" fill="none" stroke="hsl(var(--primary) / 0.4)" strokeWidth="1"
                  initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1.3, opacity: [0.6, 0] }} transition={{ duration: 1, repeat: Infinity }} />
                <motion.rect x="-14" y="-18" width="28" height="12" rx="4" fill="hsl(var(--primary))"
                  initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: -18 }} transition={{ duration: 0.2 }} />
                <motion.text x="0" y="-11" textAnchor="middle" fontSize="5" fill="hsl(var(--primary-foreground))" fontFamily="var(--font-sans)" fontWeight="600"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>Transfer</motion.text>
              </>
            )}
          </g>

          {/* === BRANCH CARS === */}
          <g style={{ opacity: splitVisible ? 1 : 0 }} className="cursor-pointer" onMouseEnter={() => setHoveredCar('up')} onMouseLeave={() => setHoveredCar(null)}>
            <animateMotion ref={animCallbackRefUp} dur="2s" begin="indefinite" fill="freeze" path={branchUp}
              keyPoints="0;1" keyTimes="0;1" calcMode="spline" keySplines="0.42 0 0.58 1" rotate="auto" />
            <CarShape />
            {hoveredCar === 'up' && (
              <motion.ellipse cx="0" cy="0" rx="16" ry="12" fill="none" stroke="hsl(var(--primary) / 0.3)" strokeWidth="1"
                initial={{ scale: 0.8 }} animate={{ scale: 1.3, opacity: [0.5, 0] }} transition={{ duration: 1, repeat: Infinity }} />
            )}
          </g>
          <g style={{ opacity: splitVisible ? 1 : 0 }} className="cursor-pointer" onMouseEnter={() => setHoveredCar('down')} onMouseLeave={() => setHoveredCar(null)}>
            <animateMotion ref={animCallbackRefDown} dur="2s" begin="indefinite" fill="freeze" path={branchDown}
              keyPoints="0;1" keyTimes="0;1" calcMode="spline" keySplines="0.42 0 0.58 1" rotate="auto" />
            <CarShape />
            {hoveredCar === 'down' && (
              <motion.ellipse cx="0" cy="0" rx="16" ry="12" fill="none" stroke="hsl(var(--primary) / 0.3)" strokeWidth="1"
                initial={{ scale: 0.8 }} animate={{ scale: 1.3, opacity: [0.5, 0] }} transition={{ duration: 1, repeat: Infinity }} />
            )}
          </g>
          <g style={{ opacity: splitVisible ? 1 : 0 }} className="cursor-pointer" onMouseEnter={() => setHoveredCar('left')} onMouseLeave={() => setHoveredCar(null)}>
            <animateMotion ref={animCallbackRefLeft} dur="2s" begin="indefinite" fill="freeze" path={branchLeft}
              keyPoints="0;1" keyTimes="0;1" calcMode="spline" keySplines="0.42 0 0.58 1" rotate="auto" />
            <CarShape />
            {hoveredCar === 'left' && (
              <motion.ellipse cx="0" cy="0" rx="16" ry="12" fill="none" stroke="hsl(var(--primary) / 0.3)" strokeWidth="1"
                initial={{ scale: 0.8 }} animate={{ scale: 1.3, opacity: [0.5, 0] }} transition={{ duration: 1, repeat: Infinity }} />
            )}
          </g>

          {/* Splash effects on ocean click */}
          {splashes.map(s => <SplashEffect key={s.id} x={s.x} y={s.y} />)}

          {/* Title */}
          <motion.text x="250" y="28" textAnchor="middle" fontSize="11" fill="hsl(var(--muted-foreground))" fontFamily="var(--font-sans)" letterSpacing="0.2em" fontWeight="300"
            initial={{ opacity: 0, y: -10 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.3 }}>
            BOA VISTA, CAPO VERDE
          </motion.text>

          {/* Compass */}
          <motion.g initial={{ opacity: 0, rotate: -90 }} animate={isInView ? { opacity: 0.5, rotate: 0 } : {}} transition={{ delay: 1, duration: 0.8 }}>
            <circle cx="460" cy="48" r="14" fill="none" stroke="hsl(var(--border))" strokeWidth="0.8" />
            <text x="460" y="41" textAnchor="middle" fontSize="7" fill="hsl(var(--muted-foreground))" fontFamily="var(--font-sans)" fontWeight="600">N</text>
            <line x1="460" y1="43" x2="460" y2="55" stroke="hsl(var(--muted-foreground))" strokeWidth="0.8" />
            <polygon points="460,43 457,49 463,49" fill="hsl(var(--muted-foreground) / 0.5)" />
          </motion.g>

          {/* Scale */}
          <motion.g initial={{ opacity: 0 }} animate={isInView ? { opacity: 0.4 } : {}} transition={{ delay: 1.2 }}>
            <line x1="390" y1="345" x2="455" y2="345" stroke="hsl(var(--foreground))" strokeWidth="1" />
            <line x1="390" y1="342" x2="390" y2="348" stroke="hsl(var(--foreground))" strokeWidth="1" />
            <line x1="455" y1="342" x2="455" y2="348" stroke="hsl(var(--foreground))" strokeWidth="1" />
            <text x="422" y="357" textAnchor="middle" fontSize="7" fill="hsl(var(--muted-foreground))" fontFamily="var(--font-sans)">5 km</text>
          </motion.g>
        </svg>
      </motion.div>
    </div>
  );
};

export default TransferMap;
