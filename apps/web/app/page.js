'use client';
import { useState } from 'react';

export default function Health() {
  const [health, setHealth] = useState(null);
  const ping = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/health`);
    setHealth(await res.json());
  };
  return (
    <main style={{ padding: 24 }}>
      <h1>Frontend OK</h1>
      <button onClick={ping}>Testar /health da API</button>
      <pre>{health ? JSON.stringify(health, null, 2) : '—'}</pre>
    </main>
  );
}
