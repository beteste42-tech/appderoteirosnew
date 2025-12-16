import { useRef } from 'react';
import { exportElementsToPdf } from '../lib/pdf';
export default function Resumo() {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div>
      <div ref={ref}>Resumo</div>
      <button onClick={() => ref.current && exportElementsToPdf([ref.current], { fileName: 'Resumo.pdf' })}>Exportar PDF</button>
    </div>
  );
}
