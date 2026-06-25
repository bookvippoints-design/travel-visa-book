import { Document } from '@react-pdf/renderer'
import { CoverPage } from './pages/CoverPage'
import { SummaryPage } from './pages/SummaryPage'
import { PassengerPage } from './pages/PassengerPage'
import { FlightsPage } from './pages/FlightsPage'
import { HotelsPage } from './pages/HotelsPage'
import { ItineraryPage } from './pages/ItineraryPage'
import { DeclarationPage } from './pages/DeclarationPage'

function calcPages(data) {
  const flights = data.flights?.length || 0
  const hotels = data.hotels?.length || 0
  const days = data.itinerary?.length || 0
  const flightPages = Math.max(1, Math.ceil(flights / 2))
  const hotelPages = Math.max(1, Math.ceil(hotels / 3))
  const itinPages = Math.max(1, Math.ceil(days / 2))
  return { flightPages, hotelPages, itinPages, total: 3 + flightPages + hotelPages + itinPages + 1 }
}

export function TVBDocument({ data, company }) {
  const trip = data.trip || {}
  const { flightPages, hotelPages, itinPages, total } = calcPages(data)

  const base = {
    company,
    expeditionCode: trip.expeditionCode,
    emissionDate: trip.emissionDate,
    totalPages: total,
  }

  let pg = 2
  const summaryMeta  = { ...base, pageNumber: pg++ }
  const passMeta     = { ...base, pageNumber: pg++ }
  const flightMeta   = { ...base, pageNumber: pg };  pg += flightPages
  const hotelMeta    = { ...base, pageNumber: pg };  pg += hotelPages
  const itinMeta     = { ...base, pageNumber: pg };  pg += itinPages
  const declMeta     = { ...base, pageNumber: pg }

  return (
    <Document
      title={trip.title || 'Travel Visa Book'}
      author={company?.commercial_name || 'Travel Visa Book'}
      subject={`Itinerario — ${data.passengers?.[0]?.name || ''}`}
      creator="Travel Visa Book"
    >
      <CoverPage data={data} company={company} />
      <SummaryPage   data={data} company={company} meta={summaryMeta} />
      <PassengerPage data={data} company={company} meta={passMeta} />
      <FlightsPage   data={data} company={company} meta={flightMeta} />
      <HotelsPage    data={data} company={company} meta={hotelMeta} />
      <ItineraryPage data={data} company={company} meta={itinMeta} />
      <DeclarationPage data={data} company={company} meta={declMeta} />
    </Document>
  )
}
