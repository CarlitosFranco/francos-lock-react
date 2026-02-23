import React from 'react';

const ModalFoto = ({ foto, onClose }) => {
  if (!foto) return null;

  return (
    <div className="modal" style={{ display: 'flex' }} onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <img src={foto} alt="Producto" />
      </div>
    </div>
  );
};

export default ModalFoto;