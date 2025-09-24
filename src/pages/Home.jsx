// src/pages/Home.jsx — test visuel temporaire
import React from 'react';

export default function Home() {
  return (
    <main style={{
      minHeight: '100vh',
      display: 'grid',
      placeItems: 'center',
      background: '#0E1020',
      color: '#E9E7FF',
      fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Inter, Arial'
    }}>
      <div style={{
        padding: '24px 28px',
        borderRadius: 16,
        background: 'rgba(255,255,255,.06)',
        border: '1px solid rgba(255,255,255,.12)'
      }}>
        <h1 style={{margin: 0, fontSize: 28}}>YapS est monté ✅</h1>
        <p style={{marginTop: 8, opacity: .85}}>Ceci est un écran de test temporaire.</p>
      </div>
    </main>
  );
}
