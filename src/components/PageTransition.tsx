import { motion } from "framer-motion";
import { ReactNode, useEffect } from "react";

const PageTransition = ({ children }: { children: ReactNode }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.6,
          ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
        },
      }}
      exit={{
        opacity: 0,
        y: -10,
        transition: {
          duration: 0.4,
          ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
        },
      }}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
