import { useState } from 'react'
import { pdf } from '@react-pdf/renderer'
import { TVBDocument } from './TVBDocument'
import { FileDown, Loader } from 'lucide-react'

export function PDFButton({ data, company, label = 'Exportar PDF', className = '' }) {
  const [loading, setLoading] = useState(false)

  async function generatePDF() {
    setLoading(true)
    try {
      const doc = <TVBDocument data={data} company={company} />
      const blob = await pdf(doc).toBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const passengerName = data.passengers?.[0]?.name?.replace(/\s+/g, '-') || 'pasajero'
      const code = data.trip?.expeditionCode || 'TVB'
      a.download = `${code}-${passengerName}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('PDF error:', err)
      alert('Error al generar el PDF: ' + err.message)
    }
    setLoading(false)
  }

  return (
    <button
      onClick={generatePDF}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-all shadow-md ${className}`}
      style={{ background: loading ? '#94a3b8' : '#B8860B' }}
    >
      {loading
        ? <><Loader className="w-4 h-4 animate-spin" /> Generando PDF...</>
        : <><FileDown className="w-4 h-4" /> {label}</>
      }
    </button>
  )
}
