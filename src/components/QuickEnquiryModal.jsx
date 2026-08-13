import { useState } from 'react';
import { EnquiryForm } from './Hero';

export default function QuickEnquiryModal({ open, onClose }) {
  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <EnquiryForm onSuccess={() => globalThis.setTimeout(onClose, 2000)} />
      </div>
    </div>
  );
}
