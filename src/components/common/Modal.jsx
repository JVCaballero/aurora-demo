import { useEffect } from 'react';
import './Modal.css';

const Modal = ({ isOpen, onClose, title, children, size = 'medium' }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className={`modal modal--${size}`}>
        <div className="modal__header">
          <h2 className="modal__title">{title}</h2>
          <button
            className="modal__close"
            onClick={onClose}
            aria-label="Close modal"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="modal__content">
          {children}
        </div>
      </div>

      <style jsx>{`
        .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
          animation: fadeIn 0.2s ease;
        }
        .modal {
          background: var(--white);
          border-radius: 12px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          max-height: 90vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          animation: slideUp 0.3s ease;
        }
        .modal--small {
          width: 100%;
          max-width: 400px;
        }
        .modal--medium {
          width: 100%;
          max-width: 600px;
        }
        .modal--large {
          width: 100%;
          max-width: 800px;
        }
        .modal__header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid var(--gray-200);
        }
        .modal__title {
          margin: 0;
          font-family: 'Anton', sans-serif;
          font-size: 1.25rem;
          color: var(--ink);
          letter-spacing: 0.5px;
        }
        .modal__close {
          background: none;
          border: none;
          color: var(--gray-500);
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 6px;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .modal__close:hover {
          background: var(--gray-100);
          color: var(--ink);
        }
        .modal__content {
          padding: 1.5rem;
          overflow-y: auto;
          flex: 1;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        [data-theme="dark"] .modal {
          background: var(--gray-900);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        }
        [data-theme="dark"] .modal__header {
          border-color: var(--gray-700);
        }
        [data-theme="dark"] .modal__title {
          color: var(--gray-100);
        }
        [data-theme="dark"] .modal__close {
          color: var(--gray-400);
        }
        [data-theme="dark"] .modal__close:hover {
          background: var(--gray-800);
          color: var(--gray-200);
        }
      `}</style>
    </div>
  );
};

export default Modal;