import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

export const BottomSheet = ({ children, setSheetOpen }) => {
  return createPortal(
    <AnimatePresence>
      <motion.div
        key={"backdrop"}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{
          opacity: 0,
          transition: { duration: 0.15, ease: "easeIn" },
        }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="fixed inset-0 z-40 bg-black/40 font-body lg:hidden"
      />
      <motion.div
        key={"content"}
        className="bg-white h-auto w-full flex flex-col items-center justify-between fixed bottom-0 rounded-t-4xl gap-6 pt-4 px-5  pb-17 z-50 lg:hidden"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{
          y: "100%",
          transition: { duration: 0.25, ease: "easeIn" },
        }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        drag="y"
        dragConstraints={{ top: 0 }}
        dragElastic={{ top: 0, bottom: 0.2 }}
        onDragEnd={(_, info) => {
          if (info.offset.y > 100) setSheetOpen(false);
        }}
      >
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-1" />
        {children}
        
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
};
