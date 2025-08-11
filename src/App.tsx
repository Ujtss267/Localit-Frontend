// src/App.tsx
//실질적으로 사용하지 않음(main.tsx 에서 다함)
import { RouterProvider } from "react-router-dom";
import { router } from "./app/router";

export default function App() {
  return <RouterProvider router={router} />;
}
