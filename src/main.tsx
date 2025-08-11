// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import QueryProvider from "./app/providers/QueryProvider";
import { RouterProvider } from "react-router-dom";
import { router } from "./app/router";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryProvider>
      <RouterProvider router={router} />
    </QueryProvider>
  </React.StrictMode>
);
