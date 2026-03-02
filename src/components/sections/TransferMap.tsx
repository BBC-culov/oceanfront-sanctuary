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

  // Route from airport (west) to Bazhouse (east coast)
  const routePath =
    "M 148 200 C 165 195, 185 185, 210 175 C 235 165, 260 155, 285 148 C 310 141, 335 138, 355 142 C 370 145, 380 155, 385 168";

  // Real localities based on Boa Vista map
  const localities = [
    { x: 175, y: 170, name: "Sal Rei", size: 9 },
    { x: 155, y: 210, name: "Rabil", size: 8 },
    { x: 270, y: 195, name: "Fundo das Figueiras", size: 7 },
    { x: 140, y: 265, name: "Povoação Velha", size: 7 },
    { x: 290, y: 165, name: "Bofareira", size: 7 },
  ];

  const beaches = [
    { x: 100, y: 130, name: "Praia de Estoril", icon: "🏖" },
    { x: 300, y: 90, name: "Cabo Santa Maria", icon: "🏖" },
    { x: 85, y: 290, name: "Praia de Santa Mónica", icon: "🏖" },
    { x: 360, y: 105, name: "Praia de Chaves", icon: "🏖" },
  ];

  const pois = [
    { x: 260, y: 220, name: "Monte Estância", icon: "⛰️", size: 7 },
    { x: 105, y: 105, name: "Ponta do Sol", icon: "🌅", size: 6.5 },
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
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.path
              key={`wave-${i}`}
              d={`M ${10 + i * 8} ${320 + i * 10} Q ${130 + i * 5} ${312 + i * 8}, ${250} ${318 + i * 6} Q ${370 - i * 5} ${324 + i * 4}, ${490 - i * 8} ${315 + i * 12}`}
              stroke="hsl(var(--ocean) / 0.12)"
              strokeWidth="0.8"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
              transition={{ duration: 2, delay: 0.8 + i * 0.15 }}
            />
          ))}

          {/* Island shape - Boa Vista realistic outline matching real map */}
          {/* Shape: wider west coast, narrower east, angular NW point, curved south */}
          <motion.path
            d="M 120 115 C 108 120, 92 135, 85 155 C 78 175, 80 195, 88 215 C 92 225, 98 235, 108 248 C 118 261, 128 272, 142 282 C 158 293, 178 300, 200 305 C 225 310, 255 310, 285 305 C 315 300, 340 288, 365 272 C 385 258, 400 240, 410 218 C 418 198, 420 178, 415 158 C 410 138, 398 122, 380 110 C 362 98, 340 90, 315 85 C 290 80, 262 78, 235 80 C 210 82, 188 88, 168 96 C 150 103, 135 110, 120 115 Z"
            fill="url(#islandGrad)"
            filter="url(#islandShadow)"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />

          {/* Inner terrain lines */}
          <motion.path
            d="M 130 180 C 200 165, 300 155, 390 175"
            stroke="hsl(var(--sand) / 0.5)"
            strokeWidth="0.5"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
          />
          <motion.path
            d="M 110 230 C 190 215, 310 210, 400 225"
            stroke="hsl(var(--sand) / 0.4)"
            strokeWidth="0.5"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
          />

          {/* Minor roads */}
          <motion.path
            d="M 175 170 L 160 200 L 155 210"
            stroke="hsl(var(--border))"
            strokeWidth="1"
            strokeDasharray="3 3"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
            transition={{ duration: 1.2, delay: 0.4 }}
          />
          <motion.path
            d="M 155 210 L 155 250 L 145 270"
            stroke="hsl(var(--border))"
            strokeWidth="1"
            strokeDasharray="3 3"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
          />

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
              <text x={poi.x} y={poi.y} fontSize="12" className="select-none">{poi.icon}</text>
              <text
                x={poi.x + 16}
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
              transition={{ delay: 0.8 + i * 0.15 }}
            >
              <text x={b.x} y={b.y} fontSize="10" className="select-none">{b.icon}</text>
              <text
                x={b.x + 14}
                y={b.y + 3}
                fontSize="6"
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
              transition={{ delay: 0.6 + i * 0.12, type: "spring", stiffness: 200 }}
            >
              <circle cx={loc.x} cy={loc.y} r="2.5" fill="hsl(var(--foreground) / 0.3)" />
              <text
                x={loc.x + 6}
                y={loc.y + 3}
                fontSize={loc.size}
                fill="hsl(var(--foreground) / 0.55)"
                fontFamily="var(--font-sans)"
                fontWeight="400"
              >
                {loc.name}
              </text>
            </motion.g>
          ))}

          {/* Airport marker (west side, near Rabil) */}
          <motion.g
            initial={{ opacity: 0, scale: 0 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
            transition={{ duration: 0.5, delay: 0.8, type: "spring" }}
          >
            <motion.circle
              cx="148" cy="200" r="12"
              fill="none"
              stroke="hsl(var(--primary) / 0.3)"
              strokeWidth="1.5"
              initial={{ scale: 0.8, opacity: 1 }}
              animate={{ scale: 1.8, opacity: 0 }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
            />
            <circle cx="148" cy="200" r="9" fill="hsl(var(--primary))" />
            <circle cx="148" cy="200" r="4.5" fill="hsl(var(--primary-foreground))" />
            <text x="139" y="185" fontSize="16" className="select-none">✈️</text>
            <rect x="105" y="215" width="86" height="16" rx="3" fill="hsl(var(--primary))" />
            <text
              x="148"
              y="226"
              textAnchor="middle"
              fontSize="8"
              fill="hsl(var(--primary-foreground))"
              fontFamily="var(--font-sans)"
              fontWeight="600"
              letterSpacing="0.05em"
            >
              Aeroporto BVC
            </text>
          </motion.g>

          {/* Bazhouse destination marker (east coast) */}
          <motion.g
            initial={{ opacity: 0, scale: 0 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
            transition={{ duration: 0.6, delay: 3.5, type: "spring", stiffness: 250 }}
            filter="url(#glow)"
          >
            <motion.circle
              cx="385" cy="168" r="14"
              fill="none"
              stroke="hsl(var(--accent) / 0.4)"
              strokeWidth="1.5"
              initial={{ scale: 0.8, opacity: 1 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
            />
            <circle cx="385" cy="168" r="11" fill="hsl(var(--primary))" />
            <circle cx="385" cy="168" r="5.5" fill="hsl(var(--accent))" />
            <text x="376" y="153" fontSize="16" className="select-none">🏠</text>
            <rect x="337" y="183" width="96" height="28" rx="3" fill="hsl(var(--primary))" />
            <text
              x="385"
              y="195"
              textAnchor="middle"
              fontSize="7.5"
              fill="hsl(var(--primary-foreground))"
              fontFamily="var(--font-sans)"
              fontWeight="400"
              letterSpacing="0.04em"
            >
              Appartamento
            </text>
            <text
              x="385"
              y="206"
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

          {/* Animated car along the path */}
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
            <circle cx="455" cy="45" r="14" fill="none" stroke="hsl(var(--border))" strokeWidth="0.8" />
            <text
              x="455"
              y="38"
              textAnchor="middle"
              fontSize="7"
              fill="hsl(var(--muted-foreground))"
              fontFamily="var(--font-sans)"
              fontWeight="600"
            >
              N
            </text>
            <line x1="455" y1="40" x2="455" y2="52" stroke="hsl(var(--muted-foreground))" strokeWidth="0.8" />
            <polygon points="455,40 452,46 458,46" fill="hsl(var(--muted-foreground) / 0.5)" />
          </motion.g>

          {/* Scale bar */}
          <motion.g
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 0.4 } : { opacity: 0 }}
            transition={{ delay: 1.2 }}
          >
            <line x1="380" y1="340" x2="450" y2="340" stroke="hsl(var(--foreground))" strokeWidth="1" />
            <line x1="380" y1="337" x2="380" y2="343" stroke="hsl(var(--foreground))" strokeWidth="1" />
            <line x1="450" y1="337" x2="450" y2="343" stroke="hsl(var(--foreground))" strokeWidth="1" />
            <text
              x="415"
              y="352"
              textAnchor="middle"
              fontSize="7"
              fill="hsl(var(--muted-foreground))"
              fontFamily="var(--font-sans)"
            >
              5 km
            </text>
          </motion.g>
        </svg>
      </motion.div>
    </div>
  );
};

export default TransferMap;
