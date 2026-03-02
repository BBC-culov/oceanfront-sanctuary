import { motion } from "framer-motion";

const TransferMap = () => {
  const routePath =
    "M 95 215 C 115 210, 130 200, 155 185 C 180 170, 200 155, 230 140 C 260 125, 285 115, 310 110 C 335 105, 355 108, 375 120 C 390 130, 395 145, 388 165";

  // Localities along the route
  const localities = [
    { x: 140, y: 230, name: "Rabil", size: 8 },
    { x: 215, y: 120, name: "Sal Rei", size: 9 },
    { x: 310, y: 170, name: "Praia Cabral", size: 8 },
    { x: 175, y: 260, name: "Estância de Baixo", size: 7 },
    { x: 330, y: 220, name: "Praia da Cruz", size: 7 },
  ];

  // Beach markers
  const beaches = [
    { x: 360, y: 85, name: "Praia de Chaves" },
    { x: 130, y: 140, name: "Praia de Estoril" },
  ];

  return (
    <div className="relative w-full max-w-xl mx-auto lg:mx-0" style={{ perspective: "800px" }}>
      {/* 3D tilt wrapper */}
      <motion.div
        initial={{ rotateX: 8, opacity: 0, y: 30 }}
        whileInView={{ rotateX: 4, opacity: 1, y: 0 }}
        viewport={{ once: true }}
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
            {/* Ocean gradient */}
            <radialGradient id="oceanGrad" cx="50%" cy="50%" r="60%">
              <stop offset="0%" stopColor="hsl(var(--ocean) / 0.08)" />
              <stop offset="100%" stopColor="hsl(var(--ocean) / 0.15)" />
            </radialGradient>
            {/* Island gradient for 3D feel */}
            <radialGradient id="islandGrad" cx="40%" cy="35%" r="55%">
              <stop offset="0%" stopColor="hsl(var(--sand-light))" />
              <stop offset="70%" stopColor="hsl(var(--sand))" />
              <stop offset="100%" stopColor="hsl(var(--sand) / 0.8)" />
            </radialGradient>
            {/* Island shadow */}
            <filter id="islandShadow" x="-10%" y="-10%" width="130%" height="140%">
              <feDropShadow dx="3" dy="6" stdDeviation="8" floodColor="hsl(var(--foreground) / 0.12)" />
            </filter>
            {/* Glow for markers */}
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {/* Road texture */}
            <pattern id="roadDash" patternUnits="userSpaceOnUse" width="12" height="4" patternTransform="rotate(0)">
              <rect width="7" height="2" y="1" fill="hsl(var(--primary-foreground) / 0.6)" rx="1" />
            </pattern>
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
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 2, delay: 0.8 + i * 0.15 }}
            />
          ))}

          {/* Island shape with shadow */}
          <motion.path
            d="M 70 220 C 75 175, 95 135, 130 110 C 160 90, 200 70, 250 62 C 300 54, 350 60, 390 80 C 420 95, 440 120, 445 155 C 450 190, 435 225, 405 248 C 375 270, 340 280, 300 282 C 260 284, 220 278, 180 268 C 140 258, 105 248, 85 238 C 72 232, 68 228, 70 220 Z"
            fill="url(#islandGrad)"
            filter="url(#islandShadow)"
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />

          {/* Inner terrain lines for depth */}
          <motion.path
            d="M 150 180 C 200 160, 280 150, 350 170"
            stroke="hsl(var(--sand) / 0.5)"
            strokeWidth="0.5"
            fill="none"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.5 }}
          />
          <motion.path
            d="M 120 210 C 180 195, 300 190, 400 210"
            stroke="hsl(var(--sand) / 0.4)"
            strokeWidth="0.5"
            fill="none"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
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
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, delay: 0.4 }}
          />

          {/* Main road background (wider, for depth) */}
          <motion.path
            d={routePath}
            stroke="hsl(var(--foreground) / 0.08)"
            strokeWidth="10"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
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
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
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
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 2.5, delay: 1, ease: "easeInOut" }}
          />

          {/* Beach markers */}
          {beaches.map((b, i) => (
            <motion.g
              key={`beach-${i}`}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
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
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
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
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.8, type: "spring" }}
          >
            {/* Pulse ring */}
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
            {/* Airplane */}
            <text x="87" y="200" fontSize="18" className="select-none">✈️</text>
            {/* Label with background */}
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
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 3.5, type: "spring", stiffness: 250 }}
            filter="url(#glow)"
          >
            {/* Pulse ring */}
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
            {/* Home icon */}
            <text x="379" y="150" fontSize="18" className="select-none">🏠</text>
            {/* Label with background */}
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
          <motion.g
            initial={{ x: 95, y: 215, opacity: 0 }}
            whileInView={{
              x: [95, 115, 155, 200, 230, 270, 310, 345, 375, 388],
              y: [215, 210, 185, 158, 140, 125, 110, 112, 125, 165],
              opacity: [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
            }}
            viewport={{ once: true }}
            transition={{ duration: 3, delay: 1, ease: "easeInOut" }}
          >
            {/* Car shadow */}
            <ellipse cx="0" cy="5" rx="10" ry="3" fill="hsl(var(--foreground) / 0.1)" />
            {/* Car body */}
            <rect x="-12" y="-7" width="24" height="14" rx="4" fill="hsl(var(--primary))" />
            <rect x="-8" y="-5" width="8" height="6" rx="1.5" fill="hsl(var(--ocean) / 0.4)" />
            <rect x="2" y="-5" width="6" height="6" rx="1.5" fill="hsl(var(--ocean) / 0.3)" />
            {/* Wheels */}
            <circle cx="-7" cy="7" r="2.5" fill="hsl(var(--foreground) / 0.7)" />
            <circle cx="7" cy="7" r="2.5" fill="hsl(var(--foreground) / 0.7)" />
            <circle cx="-7" cy="7" r="1" fill="hsl(var(--foreground) / 0.3)" />
            <circle cx="7" cy="7" r="1" fill="hsl(var(--foreground) / 0.3)" />
          </motion.g>

          {/* Distance indicator */}
          <motion.g
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 3.8 }}
          >
            <rect x="185" y="85" width="80" height="22" rx="11" fill="hsl(var(--primary) / 0.9)" />
            <text
              x="225"
              y="100"
              textAnchor="middle"
              fontSize="8"
              fill="hsl(var(--primary-foreground))"
              fontFamily="var(--font-sans)"
              fontWeight="500"
            >
              ~ 15 min
            </text>
          </motion.g>

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
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            BOA VISTA, CAPO VERDE
          </motion.text>

          {/* Compass */}
          <motion.g
            initial={{ opacity: 0, rotate: -90 }}
            whileInView={{ opacity: 0.5, rotate: 0 }}
            viewport={{ once: true }}
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
