// src/component/Modal.jsx
import React from 'react';

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modalContent}>
        <div style={styles.header}>
          <h3 style={styles.title}>{title}</h3>
          <button onClick={onClose} style={styles.closeBtn}>❌</button>
        </div>
        <div style={styles.body}>
          {children}
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 },
  modalContent: { backgroundColor: 'white', borderRadius: '12px', width: '90%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', borderBottom: '1px solid #eee' },
  title: { margin: 0, color: 'var(--text-dark)' },
  closeBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' },
  body: { padding: '20px' }
};

export default Modal;