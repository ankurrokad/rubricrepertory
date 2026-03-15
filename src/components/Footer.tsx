import React from 'react';

interface FooterProps {
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

const Footer: React.FC<FooterProps> = ({ theme, onToggleTheme }) => {
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
      <div className="flex items-center gap-3">
        <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>Kent Repertory</span>
        {onToggleTheme && (
          <button
            onClick={onToggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            className="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 hover:opacity-80"
            style={{
              backgroundColor: 'var(--bg-card)',
              color: 'var(--text-secondary)',
            }}
          >
            {theme === 'light' ? (
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            ) : (
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            )}
          </button>
        )}
      </div>
    </footer>
  );
};

export default Footer;
