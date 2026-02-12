'use client';

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function ModulePortal({ 
  open, 
  onClose, 
  children 
}: { 
  open: boolean;
  onClose?: ()=> void;
  children: React.ReactNode;
}) {
  const [visible, setVisible] = useState(open);
  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisible(true);
    } else {
      const timer =  setTimeout(() => setVisible(false), 250);
      return () => clearTimeout(timer);
    }
  }, [open]);

  if (!visible) return null;

  return createPortal(
    <>
      <div
        className={`popover-backdrop ${open ? "fade-in" : "fade-out"}`}
        onClick={onClose}
      />
      <div 
        className={`popover-panel ${open ? "pop-in" : "pop-out"}`}
      >
        {children}
      </div>
    </>,
    document.body
  );
}