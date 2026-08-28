import { useEffect, useRef } from 'react';
import QRCodeLib from 'qrcode';

const QRCode = ({ value, size = 240, className = '' }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !value) return;
    QRCodeLib.toCanvas(canvasRef.current, value, {
      width: size,
      margin: 1,
      color: { dark: '#0c0d11', light: '#ffffff' }
    }).catch((err) => console.error('QR render error:', err));
  }, [value, size]);

  return <canvas ref={canvasRef} className={className} />;
};

export default QRCode;
