export const metadata = { title: 'App' };
export default function RootLayout({ children }) {
  return (
    <html lang="pt-br">
      <body style={{ fontFamily: 'system-ui, sans-serif' }}>{children}</body>
    </html>
  );
}
