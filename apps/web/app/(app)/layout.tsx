import Sidebar from './sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100dvh', display: 'grid', gridTemplateColumns: '260px 1fr' }}>
      <Sidebar />
      <main style={{ padding: 24, background: '#f5f3f0' }}>{children}</main>
    </div>
  );
}
