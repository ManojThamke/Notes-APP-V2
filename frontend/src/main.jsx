import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { ThemeProvider } from "./context/ThemeContext";
import { Web3Provider } from "./context/Web3Context";


ReactDOM.createRoot(document.getElementById("root")).render(
  <ThemeProvider>
    <Web3Provider>
    <App />
    </Web3Provider>
  </ThemeProvider>
);
