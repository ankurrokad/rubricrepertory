import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer
      className="flex-shrink-0 flex items-center justify-between px-4 lg:px-6 border-t"
      style={{
        borderColor: 'var(--border-subtle)',
        backgroundColor: 'var(--bg-primary)',
        height: '36px',
        minHeight: '36px',
      }}
    >
      <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>© 2026 RubricRepertory</span>
      <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>Kent Repertory</span>
    </footer>
  );
};

export default Footer;
