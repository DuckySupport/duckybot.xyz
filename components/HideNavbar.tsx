"use client";

import { useEffect } from "react";

export default function HideNavbar() {
  useEffect(() => {
    document.body.dataset.hideNavbar = "true";
    return () => {
      delete document.body.dataset.hideNavbar;
    };
  }, []);

  return null;
}
