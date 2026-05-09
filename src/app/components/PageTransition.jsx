// components/PageTransition.jsx
import { motion } from "framer-motion";

export const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.50 }}
  >
    {children}
  </motion.div>
);