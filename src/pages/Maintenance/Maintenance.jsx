export default function Maintenance() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f7f8fa',
      fontFamily: 'DM Sans, sans-serif',
      textAlign: 'center',
      padding: '24px',
    }}>
      {/* Icon */}
      <div style={{ fontSize: '5rem', marginBottom: 24 }}>🔧</div>

      {/* Heading */}
      <h1 style={{
        fontWeight: 800, color: '#111827',
        fontSize: '2rem', margin: '0 0 12px',
        letterSpacing: '-0.5px',
      }}>
        Under Maintenance
      </h1>

      {/* Subtext */}
      <p style={{
        color: '#6b7280', fontSize: '1rem',
        margin: '0 0 32px', maxWidth: 400, lineHeight: 1.6,
      }}>
        We're currently performing scheduled maintenance.
        We'll be back up shortly. Thank you for your patience!
      </p>

      {/* Decorative bar */}
      <div style={{
        width: 60, height: 4, borderRadius: 99,
        background: 'linear-gradient(135deg, #0FB9B1, #0B8457)',
        marginBottom: 32,
      }} />

      {/* Contact info */}
      <p style={{ color: '#9ca3af', fontSize: '0.85rem', margin: 0 }}>
        Need help? Contact us at{' '}
        <a href="mailto:support@shopidoo.com"
          style={{ color: '#0b8457', fontWeight: 600, textDecoration: 'none' }}>
          support@shopidoo.com
        </a>
      </p>
    </div>
  );
}