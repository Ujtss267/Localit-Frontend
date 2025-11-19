// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import QueryProvider from "./app/providers/QueryProvider";
import { RouterProvider } from "react-router-dom";
import { router } from "./app/router";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { muiTheme } from "./app/muiTheme";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider theme={muiTheme}>
      <CssBaseline /> {/* ✅ 여기서 body 배경/텍스트를 다크로 세팅 */}
      {/* Tailwind로도 덮어쓰기 원하면 이 div에 클래스 추가 */}
      <div className="min-h-screen">
        <QueryProvider>
          <RouterProvider router={router} />
        </QueryProvider>
      </div>
    </ThemeProvider>
  </React.StrictMode>
);
