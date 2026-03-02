import { useRef, useEffect, useState, useCallback } from "react";
import { motion, useInView } from "framer-motion";

const TransferMap = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(mapRef, { once: true, margin: "0px 0px -100px 0px" });
  const [animRef, setAnimRef] = useState<SVGAnimateMotionElement | null>(null);

  const animCallbackRef = useCallback((node: SVGAnimateMotionElement | null) => {
    setAnimRef(node);
  }, []);

  useEffect(() => {
    if (isInView && animRef) {
      const timer = setTimeout(() => {
        try { animRef.beginElement(); } catch (e) { /* fallback */ }
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [isInView, animRef]);

  const routePath =
    "M 138 208 C 155 200, 175 188, 200 178 C 225 168, 255 158, 280 152 C 305 146, 330 144, 350 148 C 365 152, 375 160, 382 172";

  // Boa Vista realistic island outline
  // NW point (Ponta do Sol), N coast straight-ish, NE angular (Cabo Santa Maria area),
  // E coast with bays, SE corner, long S coast (Santa Monica), SW point, W coast with Sal Rei bay
  const islandPath = `
    M 115 138
    C 110 132, 105 125, 100 118
    C 96 112, 95 106, 100 100
    L 112 92
    C 120 88, 132 84, 148 80
    C 165 76, 185 74, 208 72
    C 230 70, 255 68, 278 68
    C 300 68, 320 70, 340 74
    C 358 78, 372 84, 388 92
    C 400 98, 408 106, 415 116
    C 420 124, 422 132, 420 142
    C 418 152, 414 162, 408 172
    C 402 182, 396 192, 392 202
    C 388 214, 386 224, 382 234
    C 378 246, 372 256, 362 264
    C 352 272, 338 278, 322 284
    C 305 290, 285 294, 262 296
    C 238 298, 215 298, 192 296
    C 170 294, 152 290, 136 284
    C 122 278, 112 270, 106 260
    C 100 250, 96 240, 94 228
    C 92 216, 94 204, 98 192
    C 102 180, 106 168, 110 156
    C 112 148, 114 144, 115 138
    Z`;

  const localities = [
    { x: 168, y: 148, name: "Sal Rei", size: 9, bold: true },
    { x: 142, y: 208, name: "Rabil", size: 8, bold: false },
    { x: 265, y: 180, name: "Fundo das Figueiras", size: 7, bold: false },
    { x: 128, y: 268, name: "Povoação Velha", size: 7, bold: false },
    { x: 280, y: 130, name: "Bofareira", size: 7, bold: false },
    { x: 310, y: 160, name: "Cabeço dos Tarafes", size: 6.5, bold: false },
    { x: 175, y: 180, name: "Estância de Baixo", size: 6.5, bold: false },
    { x: 105, y: 245, name: "João Galego", size: 6.5, bold: false },
  ];

  const beaches = [
    { x: 100, y: 105, name: "Praia de Estoril", icon: "🏖" },
    { x: 340, y: 78, name: "Cabo Santa Maria", icon: "🏖" },
    { x: 140, y: 290, name: "Praia de Santa Mónica", icon: "🏖" },
    { x: 375, y: 130, name: "Praia de Chaves", icon: "🏖" },
    { x: 90, y: 160, name: "Praia da Cruz", icon: "🏖" },
    { x: 335, y: 240, name: "Praia de Curral Velho", icon: "🏖" },
  ];

  const pois = [
    { x: 248, y: 228, name: "Monte Estância 387m", icon: "⛰️", size: 6.5 },
    { x: 97, y: 92, name: "Ponta do Sol", icon: "🌅", size: 6 },
    { x: 355, y: 265, name: "Ponta de Rife", icon: "🌊", size: 6 },
  ];

  // Secondary roads
  const secondaryRoads = [
    // Sal Rei to Rabil
    "M 170 155 L 155 180 L 148 200",
    // Rabil south to Povoação Velha
    "M 148 210 L 140 240 L 132 265",
    // East road to Fundo das Figueiras
    "M 265 180 L 290 165 L 310 158",
    // North road to Bofareira
    "M 200 140 L 240 128 L 275 125",
    // South road toward Santa Monica
    "M 200 250 L 220 270 L 250 285",
    // East coast road
    "M 370 175 L 375 200 L 370 230 L 355 255",
  ];

  return (
    <div ref={mapRef} className="relative w-full max-w-xl mx-auto lg:mx-0" style={{ perspective: "800px" }}>
      <motion.div
        initial={{ rotateX: 8, opacity: 0, y: 30 }}
        animate={isInView ? { rotateX: 4, opacity: 1, y: 0 } : { rotateX: 8, opacity: 0, y: 30 }}
        transition={{ duration: 1, ease: "easeOut" }}
        style={{ transformStyle: "preserve-3d" }}
      >
        <svg
          viewBox="0 0 500 380"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-xl"
        >
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
            <filter id="islandShadow" x="-10%" y="-10%" width="130%" height="140%">
              <feDropShadow dx="3" dy="6" stdDeviation="8" floodColor="hsl(var(--foreground) / 0.12)" />
            </filter>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background ocean */}
          <rect width="500" height="380" fill="url(#oceanGrad)" rx="8" />

          {/* Ocean wave lines */}
          {[0, 1, 2, 3].map((i) => (
            <motion.path
              key={`wave-${i}`}
              d={`M ${10 + i * 8} ${325 + i * 10} Q ${180 + i * 5} ${318 + i * 8}, ${350} ${322 + i * 6} Q ${420 - i * 5} ${328 + i * 4}, ${490 - i * 8} ${320 + i * 12}`}
              stroke="hsl(var(--ocean) / 0.10)"
              strokeWidth="0.8"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
              transition={{ duration: 2, delay: 0.8 + i * 0.15 }}
            />
          ))}

          {/* Island shape */}
          <motion.path
            d={islandPath}
            fill="url(#islandGrad)"
            filter="url(#islandShadow)"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />

          {/* Inner terrain lines */}
          <motion.path
            d="M 120 175 C 200 160, 310 155, 400 170"
            stroke="hsl(var(--sand) / 0.45)"
            strokeWidth="0.5"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
          />
          <motion.path
            d="M 110 235 C 190 220, 310 215, 390 230"
            stroke="hsl(var(--sand) / 0.35)"
            strokeWidth="0.5"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
          />
          {/* Mountain contour */}
          <motion.path
            d="M 230 210 C 245 200, 260 195, 275 210"
            stroke="hsl(var(--sand) / 0.5)"
            strokeWidth="0.6"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          />

          {/* Secondary roads */}
          {secondaryRoads.map((road, i) => (
            <motion.path
              key={`road-${i}`}
              d={road}
              stroke="hsl(var(--border))"
              strokeWidth="0.8"
              strokeDasharray="3 3"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
              transition={{ duration: 1, delay: 0.4 + i * 0.08 }}
            />
          ))}

          {/* Main road background */}
          <motion.path
            d={routePath}
            stroke="hsl(var(--foreground) / 0.08)"
            strokeWidth="10"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
            transition={{ duration: 1.5, delay: 0.3 }}
          />
          {/* Main road */}
          <motion.path
            d={routePath}
            stroke="hsl(var(--foreground) / 0.15)"
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
            transition={{ duration: 1.5, delay: 0.3 }}
          />
          {/* Road center line */}
          <path
            d={routePath}
            stroke="hsl(var(--primary-foreground) / 0.3)"
            strokeWidth="1"
            strokeDasharray="6 4"
            fill="none"
          />
          {/* Animated route highlight */}
          <motion.path
            d={routePath}
            stroke="hsl(var(--primary))"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
            transition={{ duration: 2.5, delay: 1, ease: "easeInOut" }}
          />

          {/* POI markers */}
          {pois.map((poi, i) => (
            <motion.g
              key={`poi-${i}`}
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ delay: 0.7 + i * 0.2 }}
            >
              <text x={poi.x} y={poi.y} fontSize="10" className="select-none">{poi.icon}</text>
              <text
                x={poi.x + 14}
                y={poi.y + 4}
                fontSize={poi.size}
                fill="hsl(var(--muted-foreground))"
                fontFamily="var(--font-sans)"
                fontStyle="italic"
              >
                {poi.name}
              </text>
            </motion.g>
          ))}

          {/* Beach markers */}
          {beaches.map((b, i) => (
            <motion.g
              key={`beach-${i}`}
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ delay: 0.8 + i * 0.12 }}
            >
              <text x={b.x} y={b.y} fontSize="9" className="select-none">{b.icon}</text>
              <text
                x={b.x + 12}
                y={b.y + 3}
                fontSize="5.5"
                fill="hsl(var(--muted-foreground))"
                fontFamily="var(--font-sans)"
                fontStyle="italic"
              >
                {b.name}
              </text>
            </motion.g>
          ))}

          {/* Locality dots */}
          {localities.map((loc, i) => (
            <motion.g
              key={`loc-${i}`}
              initial={{ opacity: 0, scale: 0 }}
              animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
              transition={{ delay: 0.6 + i * 0.1, type: "spring", stiffness: 200 }}
            >
              <circle cx={loc.x} cy={loc.y} r={loc.bold ? 3 : 2} fill={loc.bold ? "hsl(var(--foreground) / 0.5)" : "hsl(var(--foreground) / 0.3)"} />
              <text
                x={loc.x + 6}
                y={loc.y + 3}
                fontSize={loc.size}
                fill={loc.bold ? "hsl(var(--foreground) / 0.7)" : "hsl(var(--foreground) / 0.5)"}
                fontFamily="var(--font-sans)"
                fontWeight={loc.bold ? "600" : "400"}
              >
                {loc.name}
              </text>
            </motion.g>
          ))}

          {/* Airport marker */}
          <motion.g
            initial={{ opacity: 0, scale: 0 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
            transition={{ duration: 0.5, delay: 0.8, type: "spring" }}
          >
            <motion.circle
              cx="138" cy="208" r="12"
              fill="none"
              stroke="hsl(var(--primary) / 0.3)"
              strokeWidth="1.5"
              initial={{ scale: 0.8, opacity: 1 }}
              animate={{ scale: 1.8, opacity: 0 }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
            />
            <circle cx="138" cy="208" r="9" fill="hsl(var(--primary))" />
            <circle cx="138" cy="208" r="4.5" fill="hsl(var(--primary-foreground))" />
            <text x="129" y="194" fontSize="14" className="select-none">✈️</text>
            <rect x="95" y="222" width="86" height="16" rx="3" fill="hsl(var(--primary))" />
            <text
              x="138"
              y="233"
              textAnchor="middle"
              fontSize="7.5"
              fill="hsl(var(--primary-foreground))"
              fontFamily="var(--font-sans)"
              fontWeight="600"
              letterSpacing="0.05em"
            >
              Aeroporto BVC
            </text>
          </motion.g>

          {/* Bazhouse destination marker */}
          <motion.g
            initial={{ opacity: 0, scale: 0 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
            transition={{ duration: 0.6, delay: 3.5, type: "spring", stiffness: 250 }}
            filter="url(#glow)"
          >
            <motion.circle
              cx="382" cy="172" r="14"
              fill="none"
              stroke="hsl(var(--accent) / 0.4)"
              strokeWidth="1.5"
              initial={{ scale: 0.8, opacity: 1 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
            />
            <circle cx="382" cy="172" r="11" fill="hsl(var(--primary))" />
            <circle cx="382" cy="172" r="5.5" fill="hsl(var(--accent))" />
            <text x="373" y="157" fontSize="14" className="select-none">🏠</text>
            <rect x="334" y="187" width="96" height="28" rx="3" fill="hsl(var(--primary))" />
            <text
              x="382"
              y="199"
              textAnchor="middle"
              fontSize="7"
              fill="hsl(var(--primary-foreground))"
              fontFamily="var(--font-sans)"
              fontWeight="400"
              letterSpacing="0.04em"
            >
              Appartamento
            </text>
            <text
              x="382"
              y="210"
              textAnchor="middle"
              fontSize="8.5"
              fill="hsl(var(--accent))"
              fontFamily="var(--font-sans)"
              fontWeight="700"
              letterSpacing="0.08em"
            >
              BAZHOUSE
            </text>
          </motion.g>

          {/* Animated car */}
          <g>
            <animateMotion
              ref={animCallbackRef}
              dur="3s"
              begin="indefinite"
              fill="freeze"
              path={routePath}
              keyPoints="0;1"
              keyTimes="0;1"
              calcMode="spline"
              keySplines="0.42 0 0.58 1"
              rotate="auto"
            />
            <ellipse cx="0" cy="5" rx="10" ry="3" fill="hsl(var(--foreground) / 0.1)" />
            <rect x="-12" y="-7" width="24" height="14" rx="4" fill="hsl(var(--primary))" />
            <rect x="-8" y="-5" width="8" height="6" rx="1.5" fill="hsl(var(--ocean) / 0.4)" />
            <rect x="2" y="-5" width="6" height="6" rx="1.5" fill="hsl(var(--ocean) / 0.3)" />
            <circle cx="-7" cy="7" r="2.5" fill="hsl(var(--foreground) / 0.7)" />
            <circle cx="7" cy="7" r="2.5" fill="hsl(var(--foreground) / 0.7)" />
            <circle cx="-7" cy="7" r="1" fill="hsl(var(--foreground) / 0.3)" />
            <circle cx="7" cy="7" r="1" fill="hsl(var(--foreground) / 0.3)" />
          </g>

          {/* Title */}
          <motion.text
            x="250"
            y="28"
            textAnchor="middle"
            fontSize="11"
            fill="hsl(var(--muted-foreground))"
            fontFamily="var(--font-sans)"
            letterSpacing="0.2em"
            fontWeight="300"
            initial={{ opacity: 0, y: -10 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
            transition={{ delay: 0.3 }}
          >
            BOA VISTA, CAPO VERDE
          </motion.text>

          {/* Compass */}
          <motion.g
            initial={{ opacity: 0, rotate: -90 }}
            animate={isInView ? { opacity: 0.5, rotate: 0 } : { opacity: 0, rotate: -90 }}
            transition={{ delay: 1, duration: 0.8 }}
          >
            <circle cx="460" cy="48" r="14" fill="none" stroke="hsl(var(--border))" strokeWidth="0.8" />
            <text x="460" y="41" textAnchor="middle" fontSize="7" fill="hsl(var(--muted-foreground))" fontFamily="var(--font-sans)" fontWeight="600">N</text>
            <line x1="460" y1="43" x2="460" y2="55" stroke="hsl(var(--muted-foreground))" strokeWidth="0.8" />
            <polygon points="460,43 457,49 463,49" fill="hsl(var(--muted-foreground) / 0.5)" />
          </motion.g>

          {/* Scale bar */}
          <motion.g
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 0.4 } : { opacity: 0 }}
            transition={{ delay: 1.2 }}
          >
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
