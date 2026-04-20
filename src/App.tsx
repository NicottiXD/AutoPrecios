import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import Brands from "./Brands";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Brands />
    </BrowserRouter>
  </StrictMode>
);
