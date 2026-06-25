import { View, Text, Page } from '@react-pdf/renderer'
import { PageWrapper } from '../components/PageWrapper'
import { makeStyles, WHITE } from '../styles'

function BoardingPass({ flight, index }) {
  const typeLabel = { ida: 'IDA', regreso: 'REGRESO', 'conexión': 'CONEXIÓN', 'vuelo interno': 'INTERNO' }
  const typeColor = { ida: NAVY, regreso: '#6366f1', 'conexión': '#0891b2', 'vuelo interno': '#059669' }
  const color = typeColor[flight.type] || NAVY

  return (
    <View wrap={false} style={{ marginBottom: 14, borderWidth: 1, borderColor: color, borderRadius: 6, overflow: 'hidden' }}>
      {/* Header */}
      <View style={{ backgroundColor: color, paddingHorizontal: 14, paddingVertical: 9, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View>
          <Text style={{ fontSize: 7, color: 'rgba(255,255,255,0.7)', letterSpacing: 1 }}>
            VUELO {index + 1} · {typeLabel[flight.type] || flight.type?.toUpperCase()}
          </Text>
          <Text style={{ fontSize: 13, color: WHITE, fontFamily: 'Helvetica-Bold', marginTop: 2 }}>
            {flight.airline || '—'}
          </Text>
        </View>
        <Text style={{ fontSize: 17, color: GOLD, fontFamily: 'Helvetica-Bold' }}>
          {flight.flightNumber || '—'}
        </Text>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ fontSize: 7, color: 'rgba(255,255,255,0.7)' }}>RESERVA</Text>
          <Text style={{ fontSize: 10, color: WHITE, fontFamily: 'Helvetica-Bold', marginTop: 2 }}>
            {flight.reservationCode || '—'}
          </Text>
        </View>
      </View>

      {/* Body */}
      <View style={{ flexDirection: 'row', padding: 14, alignItems: 'center', backgroundColor: WHITE }}>
        {/* Origin */}
        <View style={{ flex: 2 }}>
          <Text style={{ fontSize: 24, color: NAVY, fontFamily: 'Helvetica-Bold' }}>
            {(flight.origin || '').toUpperCase().slice(0, 3)}
          </Text>
          <Text style={{ fontSize: 8, color: '#64748b', marginTop: 2 }}>{flight.origin || '—'}</Text>
          <Text style={{ fontSize: 7, color: '#94a3b8', marginTop: 1 }}>{flight.originAirport || ''}</Text>
          <View style={{ marginTop: 8 }}>
            <Text style={{ fontSize: 7, color: '#94a3b8' }}>SALIDA</Text>
            <Text style={{ fontSize: 12, color: NAVY, fontFamily: 'Helvetica-Bold' }}>{flight.departureTime || '—'}</Text>
            <Text style={{ fontSize: 8, color: '#64748b' }}>{flight.departureDate || '—'}</Text>
          </View>
        </View>

        {/* Center */}
        <View style={{ flex: 1, alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
            <View style={{ flex: 1, height: 1, backgroundColor: '#E2E8F0' }} />
            <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: GOLD, marginHorizontal: 2 }} />
            <Text style={{ fontSize: 14, color: GOLD }}>✈</Text>
            <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: GOLD, marginHorizontal: 2 }} />
            <View style={{ flex: 1, height: 1, backgroundColor: '#E2E8F0' }} />
          </View>
          <View style={{ marginTop: 8, alignItems: 'center' }}>
            <Text style={{ fontSize: 7, color: '#94a3b8' }}>CLASE</Text>
            <Text style={{ fontSize: 8, color: NAVY, fontFamily: 'Helvetica-Bold', marginTop: 1 }}>
              {flight.class || '—'}
            </Text>
          </View>
        </View>

        {/* Destination */}
        <View style={{ flex: 2, alignItems: 'flex-end' }}>
          <Text style={{ fontSize: 24, color: NAVY, fontFamily: 'Helvetica-Bold' }}>
            {(flight.destination || '').toUpperCase().slice(0, 3)}
          </Text>
          <Text style={{ fontSize: 8, color: '#64748b', marginTop: 2 }}>{flight.destination || '—'}</Text>
          <Text style={{ fontSize: 7, color: '#94a3b8', marginTop: 1 }}>{flight.destinationAirport || ''}</Text>
          <View style={{ marginTop: 8, alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 7, color: '#94a3b8' }}>LLEGADA</Text>
            <Text style={{ fontSize: 12, color: NAVY, fontFamily: 'Helvetica-Bold' }}>{flight.arrivalTime || '—'}</Text>
            <Text style={{ fontSize: 8, color: '#64748b' }}>{flight.arrivalDate || '—'}</Text>
          </View>
        </View>
      </View>

      {/* Bottom strip */}
      {(flight.luggage || flight.notes) && (
        <View style={{ flexDirection: 'row', backgroundColor: '#F8FAFC', paddingHorizontal: 14, paddingVertical: 7, borderTopWidth: 1, borderTopColor: BORDER, gap: 24 }}>
          {flight.luggage && (
            <Text style={{ fontSize: 7, color: '#64748b' }}>🧳 Equipaje: {flight.luggage}</Text>
          )}
          {flight.notes && (
            <Text style={{ fontSize: 7, color: '#64748b' }}>ℹ {flight.notes}</Text>
          )}
        </View>
      )}
    </View>
  )
}

export function FlightsPage({ data, company, meta }) {
  const primary = company?.primary_color || '#1A3F7A'
  const secondary = company?.secondary_color || '#B8860B'
  const styles = makeStyles(primary, secondary)
  const NAVY = primary
  const GOLD = secondary
  const LIGHT_BLUE = '#EFF6FF'
  const WHITE = '#FFFFFF'
  const BORDER = '#E2E8F0'
  const flights = data.flights || []

  // Split flights into groups of 2 per page to avoid cuts
  const pages = []
  for (let i = 0; i < flights.length; i += 2) {
    pages.push(flights.slice(i, i + 2))
  }

  if (pages.length === 0) {
    return (
      <PageWrapper company={company} {...meta}>
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Transporte Aéreo</Text>
          <Text style={{ color: '#94a3b8', fontSize: 9 }}>No hay vuelos registrados.</Text>
        </View>
      </PageWrapper>
    )
  }

  return pages.map((group, pageIdx) => (
    <PageWrapper key={pageIdx} company={company} {...meta} pageNumber={meta.pageNumber + pageIdx}>
      <View style={styles.content}>
        {pageIdx === 0 && <Text style={styles.sectionTitle}>Transporte Aéreo</Text>}
        {pageIdx > 0 && (
          <Text style={{ fontSize: 9, color: '#94a3b8', marginBottom: 12, fontStyle: 'italic' }}>
            Transporte Aéreo (continuación)
          </Text>
        )}
        {group.map((f, i) => (
          <BoardingPass key={i} flight={f} index={pageIdx * 2 + i} />
        ))}
      </View>
    </PageWrapper>
  ))
}
