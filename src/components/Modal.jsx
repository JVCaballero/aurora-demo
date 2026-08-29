import { X } from 'lucide-react';

function Modal({ isOpen, onClose, title, children, footer }) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--white)',
          borderRadius: '12px',
          padding: '24px',
          width: '100%',
          maxWidth: '500px',
          maxHeight: '80vh',
          overflow: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          color: 'var(--ink)'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        {title && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '20px' 
          }}>
            <h3 style={{ 
              fontSize: '20px', 
              fontWeight: 400,
              fontFamily: 'Anton, sans-serif',
              letterSpacing: '0.02em',
              color: 'var(--ink)'
            }}>
              {title}
            </h3>
            <button 
              onClick={onClose} 
              style={{ 
                background: 'none', 
                border: 'none', 
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={20} color="var(--gray)" />
            </button>
          </div>
        )}

        {/* Content */}
        <div style={{ marginBottom: footer ? '20px' : 0 }}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div style={{ 
            display: 'flex', 
            gap: '12px', 
            justifyContent: 'flex-end',
            paddingTop: '16px',
            borderTop: '1px solid var(--gray-light)'
          }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export default Modal;
