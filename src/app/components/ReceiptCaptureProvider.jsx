"use client";

import { createContext, useContext, useState } from "react";

const ReceiptCaptureContext = createContext(null);

export function ReceiptCaptureProvider({ children }) {
  const [capturedFile, setCapturedFile] = useState(null);
  const [scannedItems, setScannedItems] = useState(null);

  return (
    <ReceiptCaptureContext.Provider
      value={{ capturedFile, setCapturedFile, scannedItems, setScannedItems }}
    >
      {children}
    </ReceiptCaptureContext.Provider>
  );
}

export function useReceiptCapture() {
  const context = useContext(ReceiptCaptureContext);
  if (!context) {
    throw new Error("useReceiptCapture must be used within a ReceiptCaptureProvider");
  }
  return context;
}
