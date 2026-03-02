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
    "M 95 215 C 115 210, 130 200, 155 185 C 180 170, 200 155, 230 140 C 260 125, 285 115, 310 110 C 335 105, 355 108, 375 120 C 390 130, 395 145, 388 165";

  const localities = [
    { x: 140, y: 230, name: "Rabil", size: 8 },
    { x: 215, y: 120, name: "Sal Rei", size: 9 },
    { x: 310, y: 170, name: "Praia Cabral", size: 8 },
    { x: 175, y: 260, name: "Estância de Baixo", size: 7 },
    { x: 330, y: 220, name: "Praia da Cruz", size: 7 },
  ];

  const beaches = [
    { x: 360, y: 85, name: "Praia de Chaves" },
    { x: 130, y: 140, name: "Praia de Estoril" },
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
              d={`M ${10 + i * 8} ${310 + i * 12} Q ${130 + i * 5} ${300 + i * 10}, ${250} ${308 + i * 8} Q ${370 - i * 5} ${316 + i * 6}, ${490 - i * 8} ${305 + i * 14}`}
              stroke="hsl(var(--ocean) / 0.12)"
              strokeWidth="0.8"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
              transition={{ duration: 2, delay: 0.8 + i * 0.15 }}
            />
          ))}

          {/* Island shape - Boa Vista realistic outline */}
          <motion.path
            d="M 155 72 C 180 60, 220 55, 265 58 C 310 61, 350 70, 385 88 C 410 100, 430 118, 440 142 C 448 165, 445 188, 435 210 C 425 232, 408 250, 385 262 C 362 274, 335 280, 310 282 C 285 284, 258 282, 232 276 C 205 270, 178 260, 155 245 C 132 230, 112 212, 100 192 C 88 172, 82 150, 84 128 C 86 106, 98 90, 115 80 C 130 72, 142 68, 155 72 Z"
            fill="url(#islandGrad)"
            filter="url(#islandShadow)"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />

          {/* Inner terrain lines */}
          <motion.path
            d="M 150 180 C 200 160, 280 150, 350 170"
            stroke="hsl(var(--sand) / 0.5)"
            strokeWidth="0.5"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
          />
          <motion.path
            d="M 120 210 C 180 195, 300 190, 400 210"
            stroke="hsl(var(--sand) / 0.4)"
            strokeWidth="0.5"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
          />

          {/* Minor roads */}
          <motion.path
            d="M 215 120 L 215 200 L 310 170"
            stroke="hsl(var(--border))"
            strokeWidth="1"
            strokeDasharray="3 3"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
            transition={{ duration: 1.2, delay: 0.4 }}
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

          {/* Beach markers */}
          {beaches.map((b, i) => (
            <motion.g
              key={`beach-${i}`}
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ delay: 0.8 + i * 0.2 }}
            >
              <text x={b.x} y={b.y} fontSize="11" className="select-none">🏖</text>
              <text
                x={b.x + 14}
                y={b.y + 4}
                fontSize="6.5"
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

          {/* Airport marker with pulse */}
          <motion.g
            initial={{ opacity: 0, scale: 0 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
            transition={{ duration: 0.5, delay: 0.8, type: "spring" }}
          >
            <motion.circle
              cx="95" cy="215" r="12"
              fill="none"
              stroke="hsl(var(--primary) / 0.3)"
              strokeWidth="1.5"
              initial={{ scale: 0.8, opacity: 1 }}
              animate={{ scale: 1.8, opacity: 0 }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
            />
            <circle cx="95" cy="215" r="9" fill="hsl(var(--primary))" />
            <circle cx="95" cy="215" r="4.5" fill="hsl(var(--primary-foreground))" />
            <text x="87" y="200" fontSize="18" className="select-none">✈️</text>
            <rect x="48" y="228" width="95" height="18" rx="3" fill="hsl(var(--primary))" />
            <text
              x="96"
              y="240"
              textAnchor="middle"
              fontSize="8.5"
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
              cx="388" cy="165" r="14"
              fill="none"
              stroke="hsl(var(--accent) / 0.4)"
              strokeWidth="1.5"
              initial={{ scale: 0.8, opacity: 1 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
            />
            <circle cx="388" cy="165" r="11" fill="hsl(var(--primary))" />
            <circle cx="388" cy="165" r="5.5" fill="hsl(var(--accent))" />
            <text x="379" y="150" fontSize="18" className="select-none">🏠</text>
            <rect x="340" y="180" width="96" height="28" rx="3" fill="hsl(var(--primary))" />
            <text
              x="388"
              y="192"
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
              x="388"
              y="203"
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
        </svg>
      </motion.div>
    </div>
  );
};

export default TransferMap;
