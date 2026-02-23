import "./globals.css";
export const metadata = { title: "Contractor Pro" };
export default function RootLayout({ children }) {
  return (
    <html lang="hi">
      <body className="bg-gray-50 min-h-screen">{children}</body>
    </html>
  );
}