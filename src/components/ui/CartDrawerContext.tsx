"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

type CartDrawerContextType = {
  isOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  cart: any;
  setCart: (cart: any) => void;
};

const CartDrawerContext = createContext<CartDrawerContextType | undefined>(
  undefined,
);

export function CartDrawerProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [cart, setCart] = useState<any>(null);

  const openDrawer = () => setIsOpen(true);
  const closeDrawer = () => setIsOpen(false);

  return (
    <CartDrawerContext.Provider
      value={{ isOpen, openDrawer, closeDrawer, cart, setCart }}
    >
      {children}
    </CartDrawerContext.Provider>
  );
}

export function useCartDrawer() {
  const context = useContext(CartDrawerContext);
  if (!context) {
    throw new Error("useCartDrawer must be used within a CartDrawerProvider");
  }
  return context;
}

// "use client";

// import { createContext, useContext, useState, ReactNode } from "react";

// type CartDrawerContextType = {
//   isOpen: boolean;
//   openDrawer: () => void;
//   closeDrawer: () => void;
//   cart: any;
//   setCart: (cart: any) => void;
// };

// const CartDrawerContext = createContext<CartDrawerContextType | undefined>(
//   undefined,
// );

// export function CartDrawerProvider({ children }: { children: ReactNode }) {
//   const [isOpen, setIsOpen] = useState(false);
//   const [cart, setCart] = useState<any>(null);

//   const openDrawer = () => setIsOpen(true);
//   const closeDrawer = () => setIsOpen(false);

//   return (
//     <CartDrawerContext.Provider
//       value={{ isOpen, openDrawer, closeDrawer, cart, setCart }}
//     >
//       {children}
//     </CartDrawerContext.Provider>
//   );
// }

// export function useCartDrawer() {
//   const context = useContext(CartDrawerContext);
//   if (!context) {
//     throw new Error("useCartDrawer must be used within a CartDrawerProvider");
//   }
//   return context;
// }
