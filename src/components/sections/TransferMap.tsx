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

  // Realistic Boa Vista outline - more angular, irregular coastline
  const islandPath = `
    M 112 135
    C 108 128, 102 120, 98 112
    C 95 105, 96 98, 102 94
    L 115 87 C 122 83, 135 78, 155 74
    C 172 70, 195 69, 218 68
    C 242 67, 268 67, 290 69
    C 310 71, 328 74, 348 80
    C 365 86, 378 93, 392 102
    C 404 110, 412 120, 418 132
    C 422 142, 424 153, 422 165
    C 420 176, 415 186, 408 196
    C 400 208, 394 218, 390 228
    C 386 240, 380 250, 370 260
    C 358 270, 342 278, 325 284
    C 308 290, 288 294, 265 296
    C 242 298, 220 298, 198 296
    C 176 293, 158 288, 142 282
    C 128 276, 118 268, 110 258
    C 103 248, 98 238, 96 226
    C 94 214, 96 202, 100 190
    C 104 178, 108 166, 112 154
    C 114 146, 113 140, 112 135
    Z`;

  // Coastal detail paths (reef edges, sandy shores)
  const coastDetails = [
    // NW rocky coast
    "M 98 112 C 94 108, 90 104, 88 100 C 86 96, 90 92, 96 90",
    // N coast sandy edge
    "M 155 72 C 185 66, 220 64, 260 65 C 295 66, 325 70, 350 78",
    // SE coast bays
    "M 390 228 C 394 236, 392 244, 386 250 C 380 256, 372 262, 365 266",
    // S coast - Santa Monica beach line
    "M 325 286 C 295 292, 265 296, 235 298 C 210 299, 185 298, 165 294",
    // SW coast indentation
    "M 142 282 C 132 278, 122 270, 114 262 C 108 254, 104 244, 100 234",
  ];

  // Terrain texture paths
  const terrainLines = [
    "M 180 140 C 220 132, 280 128, 340 138",
    "M 130 180 C 200 168, 310 162, 400 178",
    "M 115 225 C 190 212, 320 208, 395 222",
    "M 160 260 C 210 252, 290 250, 350 258",
    // Mountain contours around Monte Estância
    "M 235 200 C 248 192, 262 190, 275 200",
    "M 230 208 C 250 196, 268 194, 282 206",
    "M 240 215 C 252 210, 264 209, 272 214",
  ];

  // Secondary roads
  const secondaryRoads = [
    "M 170 155 L 155 185 L 148 205",
    "M 148 215 L 140 245 L 132 270",
    "M 270 178 L 300 162 L 325 155",
    "M 200 142 L 245 130 L 280 128",
    "M 210 255 L 235 275 L 260 288",
    "M 372 180 L 378 210 L 370 240 L 358 260",
  ];

  // Only key labels
  const localities = [
    { x: 168, y: 150, name: "Sal Rei", size: 9, bold: true },
    { x: 142, y: 212, name: "Rabil", size: 8, bold: false },
  ];

  // Fewer beach icons, just key ones
  const beaches = [
    { x: 92, y: 100, icon: "🏖" },
    { x: 348, y: 76, icon: "🏖" },
    { x: 148, y: 292, icon: "🏖" },
    { x: 382, y: 125, icon: "🏖" },
    { x: 358, y: 258, icon: "🏖" },
  ];

  // Subtle tree/vegetation clusters
  const vegetation = [
    { x: 200, y: 160 }, { x: 220, y: 175 }, { x: 300, y: 155 },
    { x: 260, y: 200 }, { x: 180, y: 230 }, { x: 320, y: 210 },
  ];

  return (
    <div ref={mapRef} className="relative w-full max-w-xl mx-auto lg:mx-0" style={{ perspective: "800px" }}>
      <motion.div
        initial={{ rotateX: 8, opacity: 0, y: 30 }}
        animate={isInView ? { rotateX: 4, opacity: 1, y: 0 } : { rotateX: 8, opacity: 0, y: 30 }}
        transition={{ duration: 1, ease: "easeOut" }}
        style={{ transformStyle: "preserve-3d" }}
      >
        <svg viewBox="0 0 500 380" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-xl">
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
            <filter id="softBlur">
              <feGaussianBlur stdDeviation="1.5" />
            </filter>
          </defs>

          <rect width="500" height="380" fill="url(#oceanGrad)" rx="8" />

          {/* Ocean waves */}
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

          {/* Shallow water / reef edge around island */}
          <motion.path
            d={islandPath}
            fill="none"
            stroke="hsl(var(--ocean) / 0.12)"
            strokeWidth="14"
            strokeLinejoin="round"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />

          {/* Island */}
          <motion.path
            d={islandPath}
            fill="url(#islandGrad)"
            filter="url(#islandShadow)"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />

          {/* Coastal detail lines */}
          {coastDetails.map((d, i) => (
            <motion.path
              key={`coast-${i}`}
              d={d}
              stroke="hsl(var(--ocean) / 0.18)"
              strokeWidth="1.2"
              fill="none"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
              transition={{ duration: 1.2, delay: 0.4 + i * 0.1 }}
            />
          ))}

          {/* Terrain texture lines */}
          {terrainLines.map((d, i) => (
            <motion.path
              key={`terrain-${i}`}
              d={d}
              stroke={i >= 4 ? "hsl(var(--sand) / 0.55)" : "hsl(var(--sand) / 0.35)"}
              strokeWidth={i >= 4 ? "0.7" : "0.4"}
              fill="none"
              initial={{ pathLength: 0 }}
              animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
              transition={{ duration: 0.8, delay: 0.5 + i * 0.08 }}
            />
          ))}

          {/* Mountain area shading */}
          <motion.ellipse
            cx="255" cy="205" rx="30" ry="18"
            fill="url(#mountainGrad)"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 0.6 }}
          />
          {/* Mountain peak marker */}
          <motion.g
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 0.8 }}
          >
            <text x="249" y="205" fontSize="9" className="select-none">⛰️</text>
            <text x="263" y="207" fontSize="5.5" fill="hsl(var(--muted-foreground) / 0.6)" fontFamily="var(--font-sans)" fontStyle="italic">387m</text>
          </motion.g>

          {/* Vegetation dots */}
          {vegetation.map((v, i) => (
            <motion.circle
              key={`veg-${i}`}
              cx={v.x} cy={v.y} r="3"
              fill="hsl(var(--sand) / 0.4)"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 0.6 } : { opacity: 0 }}
              transition={{ delay: 0.7 + i * 0.06 }}
            />
          ))}

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

          {/* Main road bg */}
          <motion.path d={routePath} stroke="hsl(var(--foreground) / 0.08)" strokeWidth="10" fill="none" strokeLinecap="round" strokeLinejoin="round"
            initial={{ pathLength: 0 }} animate={isInView ? { pathLength: 1 } : { pathLength: 0 }} transition={{ duration: 1.5, delay: 0.3 }} />
          <motion.path d={routePath} stroke="hsl(var(--foreground) / 0.15)" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round"
            initial={{ pathLength: 0 }} animate={isInView ? { pathLength: 1 } : { pathLength: 0 }} transition={{ duration: 1.5, delay: 0.3 }} />
          <path d={routePath} stroke="hsl(var(--primary-foreground) / 0.3)" strokeWidth="1" strokeDasharray="6 4" fill="none" />
          <motion.path d={routePath} stroke="hsl(var(--primary))" strokeWidth="3" fill="none" strokeLinecap="round"
            initial={{ pathLength: 0 }} animate={isInView ? { pathLength: 1 } : { pathLength: 0 }} transition={{ duration: 2.5, delay: 1, ease: "easeInOut" }} />

          {/* Beach icons (no labels) */}
          {beaches.map((b, i) => (
            <motion.text
              key={`beach-${i}`}
              x={b.x} y={b.y}
              fontSize="10"
              className="select-none"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 0.8 } : { opacity: 0 }}
              transition={{ delay: 0.9 + i * 0.12 }}
            >
              {b.icon}
            </motion.text>
          ))}

          {/* Only key locality labels */}
          {localities.map((loc, i) => (
            <motion.g
              key={`loc-${i}`}
              initial={{ opacity: 0, scale: 0 }}
              animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
              transition={{ delay: 0.6 + i * 0.15, type: "spring", stiffness: 200 }}
            >
              <circle cx={loc.x} cy={loc.y} r={loc.bold ? 3 : 2} fill={loc.bold ? "hsl(var(--foreground) / 0.5)" : "hsl(var(--foreground) / 0.3)"} />
              <text
                x={loc.x + 6} y={loc.y + 3}
                fontSize={loc.size}
                fill={loc.bold ? "hsl(var(--foreground) / 0.7)" : "hsl(var(--foreground) / 0.5)"}
                fontFamily="var(--font-sans)"
                fontWeight={loc.bold ? "600" : "400"}
              >
                {loc.name}
              </text>
            </motion.g>
          ))}

          {/* Airport */}
          <motion.g
            initial={{ opacity: 0, scale: 0 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
            transition={{ duration: 0.5, delay: 0.8, type: "spring" }}
          >
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

          {/* Bazhouse */}
          <motion.g
            initial={{ opacity: 0, scale: 0 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
            transition={{ duration: 0.6, delay: 3.5, type: "spring", stiffness: 250 }}
            filter="url(#glow)"
          >
            <motion.circle cx="382" cy="172" r="14" fill="none" stroke="hsl(var(--accent) / 0.4)" strokeWidth="1.5"
              initial={{ scale: 0.8, opacity: 1 }} animate={{ scale: 2, opacity: 0 }} transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.5 }} />
            <circle cx="382" cy="172" r="11" fill="hsl(var(--primary))" />
            <circle cx="382" cy="172" r="5.5" fill="hsl(var(--accent))" />
            <text x="373" y="157" fontSize="14" className="select-none">🏠</text>
            <rect x="334" y="187" width="96" height="28" rx="3" fill="hsl(var(--primary))" />
            <text x="382" y="199" textAnchor="middle" fontSize="7" fill="hsl(var(--primary-foreground))" fontFamily="var(--font-sans)" fontWeight="400" letterSpacing="0.04em">
              Appartamento
            </text>
            <text x="382" y="210" textAnchor="middle" fontSize="8.5" fill="hsl(var(--accent))" fontFamily="var(--font-sans)" fontWeight="700" letterSpacing="0.08em">
              BAZHOUSE
            </text>
          </motion.g>

          {/* Car */}
          <g>
            <animateMotion ref={animCallbackRef} dur="3s" begin="indefinite" fill="freeze" path={routePath}
              keyPoints="0;1" keyTimes="0;1" calcMode="spline" keySplines="0.42 0 0.58 1" rotate="auto" />
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
          <motion.text x="250" y="28" textAnchor="middle" fontSize="11" fill="hsl(var(--muted-foreground))" fontFamily="var(--font-sans)" letterSpacing="0.2em" fontWeight="300"
            initial={{ opacity: 0, y: -10 }} animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }} transition={{ delay: 0.3 }}>
            BOA VISTA, CAPO VERDE
          </motion.text>

          {/* Compass */}
          <motion.g initial={{ opacity: 0, rotate: -90 }} animate={isInView ? { opacity: 0.5, rotate: 0 } : { opacity: 0, rotate: -90 }} transition={{ delay: 1, duration: 0.8 }}>
            <circle cx="460" cy="48" r="14" fill="none" stroke="hsl(var(--border))" strokeWidth="0.8" />
            <text x="460" y="41" textAnchor="middle" fontSize="7" fill="hsl(var(--muted-foreground))" fontFamily="var(--font-sans)" fontWeight="600">N</text>
            <line x1="460" y1="43" x2="460" y2="55" stroke="hsl(var(--muted-foreground))" strokeWidth="0.8" />
            <polygon points="460,43 457,49 463,49" fill="hsl(var(--muted-foreground) / 0.5)" />
          </motion.g>

          {/* Scale */}
          <motion.g initial={{ opacity: 0 }} animate={isInView ? { opacity: 0.4 } : { opacity: 0 }} transition={{ delay: 1.2 }}>
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
