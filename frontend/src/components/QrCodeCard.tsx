import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";

interface QrCodeCardProps {
  url: string;
  filename?: string;
}

export function QrCodeCard({ url, filename = "codigo-qr" }: QrCodeCardProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, url, { width: 220, margin: 2 }).catch(() =>
      setError("No se pudo generar el código QR"),
    );
  }, [url]);

  function handleDownload() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `${filename}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  return (
    <div className="card qr-box">
      <h3>Código QR</h3>
      {error ? <p className="error-text">{error}</p> : <canvas ref={canvasRef} />}
      <p style={{ fontSize: "0.8rem", wordBreak: "break-all" }}>{url}</p>
      <div className="btn-row">
        <button type="button" className="btn" onClick={handleDownload}>
          Descargar QR
        </button>
      </div>
    </div>
  );
}
