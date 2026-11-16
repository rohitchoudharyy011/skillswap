'use client';

import { useEffect } from 'react';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          fontFamily: 'system-ui, sans-serif',
          background: '#fafaf9',
          color: '#1c1917',
        }}
      >
        <div style={{ maxWidth: 480, textAlign: 'center' }}>
          <h1 style={{ fontSize: 24, fontWeight: 600, margin: '0 0 12px' }}>Something went wrong loading SkillSwap</h1>
          <p style={{ fontSize: 14, lineHeight: 1.6, color: '#57534e', margin: '0 0 16px' }}>
            {error.message || 'An unexpected error stopped the page from loading.'}
          </p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              height: 40,
              padding: '0 20px',
              borderRadius: 8,
              border: 'none',
              background: '#047857',
              color: '#ffffff',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
