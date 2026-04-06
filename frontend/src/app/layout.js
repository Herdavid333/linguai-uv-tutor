import "./globals.css";
import { AuthProvider } from "../context/AuthContext";

export const metadata = {
  title: "LinguAI UV",
  description: "Univalle's AI tutor for learning English",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}