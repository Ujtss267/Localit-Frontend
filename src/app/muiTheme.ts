import { createTheme } from "@mui/material/styles";

export const muiTheme = createTheme({
  palette: {
    mode: "dark",
    background: {
      // ✅ body 배경
      default: "#000000",
      // ✅ Card / Paper 배경
      paper: "#111111",
    },
    text: {
      primary: "#ffffff",
      secondary: "#c0c0c0",
    },
    primary: {
      main: "#4f8cff", // Localit 포인트 컬러
    },
    secondary: {
      main: "#ff4f81",
    },
  },
});
