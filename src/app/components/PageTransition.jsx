// components/PageTransition.jsx
import { motion } from "framer-motion";

export const PageTransition = ({ children, className = "" }) => (
  <motion.div
    className={`min-w-full min-h-full ${className}`}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 1 }}
  >
    {children}
  </motion.div>
);