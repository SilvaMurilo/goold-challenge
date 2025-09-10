import Sidebar from './sidebar';
import { getSession } from '../lib/session';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession(); // agora tem timeout
  return (
    <div style={{ minHeight:'100dvh', display:'grid', gridTemplateColumns:'260px 1fr' }}>
      <Sidebar initialUser={session?.user} />
      <main style={{ padding:24, background:'#f5f3f0' }}>{children}</main>
    </div>
  );
}
