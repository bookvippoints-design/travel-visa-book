import { Document } from '@react-pdf/renderer'
import { CoverPage } from './pages/CoverPage'
import { SummaryPage } from './pages/SummaryPage'
import { PassengerPage } from './pages/PassengerPage'
import { FlightsPage } from './pages/FlightsPage'
import { HotelsPage } from './pages/HotelsPage'
import { ItineraryPage } from './pages/ItineraryPage'
import { DeclarationPage } from './pages/DeclarationPage'

export function TVBDocument({ data, company }) {
  const trip = data.trip || {}
  const meta = {
    company,
    expeditionCode: trip.expeditionCode,
    emissionDate: trip.emissionDate,
  }

  // Count pages
  const totalPages = 7

  return (
    <Document
      title={trip.title || 'Travel Visa Book'}
      author={company?.commercial_name || 'Travel Visa Book'}
      subject={`Itinerario de viaje — ${data.passengers?.[0]?.name || ''}`}
      creator="Travel Visa Book · www.travelvisabook.com"
    >
      <CoverPage data={data} company={company} />
      <SummaryPage data={data} company={company} meta={{ ...meta, pageNumber: 2, totalPages }} />
      <PassengerPage data={data} company={company} meta={{ ...meta, pageNumber: 3, totalPages }} />
      <FlightsPage data={data} company={company} meta={{ ...meta, pageNumber: 4, totalPages }} />
      <HotelsPage data={data} company={company} meta={{ ...meta, pageNumber: 5, totalPages }} />
      <ItineraryPage data={data} company={company} meta={{ ...meta, pageNumber: 6, totalPages }} />
      <DeclarationPage data={data} company={company} meta={{ ...meta, pageNumber: 7, totalPages }} />
    </Document>
  )
}
