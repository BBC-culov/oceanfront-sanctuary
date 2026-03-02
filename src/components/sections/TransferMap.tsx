import { motion } from "framer-motion";

const TransferMap = () => {
  // Simplified stylized map of Boa Vista showing route from airport to apartment
  const routePath =
    "M 80 180 C 120 175, 140 160, 170 140 C 200 120, 230 105, 260 95 C 290 85, 310 80, 340 90 C 370 100, 380 120, 370 145";

  return (
    <div className="relative w-full aspect-[4/3] max-w-lg mx-auto lg:mx-0">
      <svg
        viewBox="0 0 450 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Island shape */}
        <motion.path
          d="M 60 200 C 80 140, 140 80, 220 60 C 300 40, 380 70, 400 130 C 420 190, 390 250, 320 270 C 250 290, 140 280, 90 250 C 70 240, 55 225, 60 200 Z"
          fill="hsl(var(--sand))"
          stroke="hsl(var(--border))"
          strokeWidth="1.5"
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />

        {/* Ocean waves decoration */}
        {[0, 1, 2].map((i) => (
          <motion.path
            key={i}
            d={`M ${30 + i * 15} ${290 + i * 8} Q ${120 + i * 10} ${280 + i * 8}, ${220 + i * 5} ${295 + i * 6} Q ${320 - i * 5} ${305 + i * 4}, ${420 - i * 10} ${290 + i * 10}`}
            stroke="hsl(var(--ocean) / 0.2)"
            strokeWidth="1"
            fill="none"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, delay: 1 + i * 0.2 }}
          />
        ))}

        {/* Route path (dashed background) */}
        <path
          d={routePath}
          stroke="hsl(var(--border))"
          strokeWidth="2"
          strokeDasharray="6 4"
          fill="none"
        />

        {/* Animated route */}
        <motion.path
          d={routePath}
          stroke="hsl(var(--primary))"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 2, delay: 1.2, ease: "easeInOut" }}
        />

        {/* Airport marker */}
        <motion.g
          initial={{ opacity: 0, scale: 0 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <circle cx="80" cy="180" r="8" fill="hsl(var(--primary))" />
          <circle cx="80" cy="180" r="4" fill="hsl(var(--primary-foreground))" />
          {/* Airplane icon */}
          <text
            x="80"
            y="168"
            textAnchor="middle"
            fontSize="16"
            className="select-none"
          >
            ✈
          </text>
          <text
            x="80"
            y="203"
            textAnchor="middle"
            fontSize="9"
            fill="hsl(var(--foreground))"
            fontFamily="var(--font-sans)"
            fontWeight="500"
          >
            Aeroporto BVC
          </text>
        </motion.g>

        {/* Bazhouse marker */}
        <motion.g
          initial={{ opacity: 0, scale: 0 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 3.2, type: "spring", stiffness: 300 }}
        >
          <circle cx="370" cy="145" r="10" fill="hsl(var(--primary))" />
          <circle cx="370" cy="145" r="5" fill="hsl(var(--primary-foreground))" />
          {/* Home icon */}
          <text
            x="370"
            y="130"
            textAnchor="middle"
            fontSize="16"
            className="select-none"
          >
            🏠
          </text>
          <text
            x="370"
            y="170"
            textAnchor="middle"
            fontSize="9"
            fill="hsl(var(--foreground))"
            fontFamily="var(--font-sans)"
            fontWeight="600"
          >
            Appartamento
          </text>
          <text
            x="370"
            y="182"
            textAnchor="middle"
            fontSize="9"
            fill="hsl(var(--foreground))"
            fontFamily="var(--font-sans)"
            fontWeight="600"
          >
            BAZHOUSE
          </text>
        </motion.g>

        {/* Animated dot traveling along the path */}
        <motion.circle
          r="4"
          fill="hsl(var(--accent))"
          initial={{ offsetDistance: "0%" }}
          whileInView={{ offsetDistance: "100%" }}
          viewport={{ once: true }}
          transition={{ duration: 2, delay: 1.2, ease: "easeInOut" }}
          style={{
            offsetPath: `path("${routePath}")`,
          }}
        />

        {/* Label */}
        <motion.text
          x="225"
          y="30"
          textAnchor="middle"
          fontSize="11"
          fill="hsl(var(--muted-foreground))"
          fontFamily="var(--font-sans)"
          letterSpacing="0.15em"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          BOA VISTA, CAPO VERDE
        </motion.text>
      </svg>
    </div>
  );
};

export default TransferMap;
