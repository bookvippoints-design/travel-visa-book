import { View, Text } from '@react-pdf/renderer'
import { PageWrapper } from '../components/PageWrapper'
import { styles, NAVY, GOLD, WHITE, LIGHT_BLUE } from '../styles'

function BoardingPass({ flight, index }) {
  const typeLabel = { ida: 'IDA', regreso: 'REGRESO', 'conexión': 'CONEXIÓN', 'vuelo interno': 'INTERNO' }
  const typeColor = { ida: NAVY, regreso: '#6366f1', 'conexión': '#0891b2', 'vuelo interno': '#059669' }

  return (
    <View style={[styles.boardingPass, { marginBottom: 10 }]}>
      {/* Header */}
      <View style={[styles.boardingHeader, { backgroundColor: typeColor[flight.type] || NAVY }]}>
        <View>
          <Text style={{ fontSize: 7, color: 'rgba(255,255,255,0.7)', letterSpacing: 1 }}>VUELO {index + 1} · {typeLabel[flight.type] || flight.type?.toUpperCase()}</Text>
          <Text style={{ fontSize: 12, color: WHITE, fontFamily: 'Helvetica-Bold', marginTop: 2 }}>{flight.airline || '—'}</Text>
        </View>
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 16, color: GOLD, fontFamily: 'Helvetica-Bold' }}>{flight.flightNumber || '—'}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ fontSize: 7, color: 'rgba(255,255,255,0.7)' }}>RESERVA</Text>
          <Text style={{ fontSize: 10, color: WHITE, fontFamily: 'Helvetica-Bold', marginTop: 2 }}>{flight.reservationCode || '—'}</Text>
        </View>
      </View>

      {/* Body */}
      <View style={{ flexDirection: 'row', padding: 14, alignItems: 'center' }}>
        {/* Origin */}
        <View style={{ flex: 2 }}>
          <Text style={{ fontSize: 22, color: NAVY, fontFamily: 'Helvetica-Bold' }}>
            {(flight.origin || '').toUpperCase().slice(0, 3)}
          </Text>
          <Text style={{ fontSize: 8, color: '#64748b', marginTop: 2 }}>{flight.origin || '—'}</Text>
          <Text style={{ fontSize: 7, color: '#94a3b8', marginTop: 1 }}>{flight.originAirport || ''}</Text>
          <View style={{ marginTop: 8 }}>
            <Text style={{ fontSize: 7, color: '#94a3b8' }}>SALIDA</Text>
            <Text style={{ fontSize: 11, color: NAVY, fontFamily: 'Helvetica-Bold' }}>{flight.departureTime || '—'}</Text>
            <Text style={{ fontSize: 8, color: '#64748b' }}>{flight.departureDate || '—'}</Text>
          </View>
        </View>

        {/* Center arrow */}
        <View style={{ flex: 1, alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
            <View style={{ flex: 1, height: 1, backgroundColor: '#E2E8F0' }} />
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: GOLD, marginHorizontal: 2 }} />
            <Text style={{ fontSize: 12, color: GOLD }}>✈</Text>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: GOLD, marginHorizontal: 2 }} />
            <View style={{ flex: 1, height: 1, backgroundColor: '#E2E8F0' }} />
          </View>
          <View style={{ marginTop: 8, alignItems: 'center' }}>
            <Text style={{ fontSize: 7, color: '#94a3b8' }}>CLASE</Text>
            <Text style={{ fontSize: 8, color: NAVY, fontFamily: 'Helvetica-Bold', marginTop: 1 }}>{flight.class || '—'}</Text>
          </View>
        </View>

        {/* Destination */}
        <View style={{ flex: 2, alignItems: 'flex-end' }}>
          <Text style={{ fontSize: 22, color: NAVY, fontFamily: 'Helvetica-Bold' }}>
            {(flight.destination || '').toUpperCase().slice(0, 3)}
          </Text>
          <Text style={{ fontSize: 8, color: '#64748b', marginTop: 2 }}>{flight.destination || '—'}</Text>
          <Text style={{ fontSize: 7, color: '#94a3b8', marginTop: 1 }}>{flight.destinationAirport || ''}</Text>
          <View style={{ marginTop: 8, alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 7, color: '#94a3b8' }}>LLEGADA</Text>
            <Text style={{ fontSize: 11, color: NAVY, fontFamily: 'Helvetica-Bold' }}>{flight.arrivalTime || '—'}</Text>
            <Text style={{ fontSize: 8, color: '#64748b' }}>{flight.arrivalDate || '—'}</Text>
          </View>
        </View>
      </View>

      {/* Bottom strip */}
      {(flight.luggage || flight.notes) && (
        <View style={{ flexDirection: 'row', backgroundColor: '#F8FAFC', paddingHorizontal: 14, paddingVertical: 6, borderTopWidth: 1, borderTopColor: '#E2E8F0', gap: 20 }}>
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
  const flights = data.flights || []
  return (
    <PageWrapper company={company} {...meta}>
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Transporte Aéreo</Text>
        {flights.length === 0
          ? <Text style={{ color: '#94a3b8', fontSize: 9 }}>No hay vuelos registrados.</Text>
          : flights.map((f, i) => <BoardingPass key={i} flight={f} index={i} />)
        }
      </View>
    </PageWrapper>
  )
}
