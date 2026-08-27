"use client";

import { createContext, useContext, useState } from "react";
import { NewBillSheet } from "./NewBillSheet";

const NewBillSheetContext = createContext(null);

export function NewBillSheetProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <NewBillSheetContext.Provider
      value={{ openNewBillSheet: () => setIsOpen(true) }}
    >
      {children}
      {isOpen && <NewBillSheet setSheetOpen={setIsOpen} />}
    </NewBillSheetContext.Provider>
  );
}

export function useNewBillSheet() {
  const context = useContext(NewBillSheetContext);
  if (!context) {
    throw new Error("useNewBillSheet must be used within a NewBillSheetProvider");
  }
  return context;
}
