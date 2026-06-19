import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from "@react-oauth/google";
import ThemeProvider from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import './index.css'

import App from './App.jsx'

createRoot(document.getElementById("root")).render(
  <StrictMode>

    <ThemeProvider>

      <GoogleOAuthProvider
        clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}
      >

        <AuthProvider>

          <App />

        </AuthProvider>

      </GoogleOAuthProvider>

    </ThemeProvider>

  </StrictMode>
);