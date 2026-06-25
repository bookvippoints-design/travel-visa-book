import { View, Text } from '@react-pdf/renderer'
import { PageWrapper } from '../components/PageWrapper'
import { styles, NAVY, GOLD, LIGHT_BLUE, GREEN } from '../styles'

function StatBox({ value, label, color = NAVY }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', padding: 12, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 4, marginRight: 6, backgroundColor: '#fff' }}>
      <Text style={{ fontSize: 22, fontFamily: 'Helvetica-Bold', color }}>{value}</Text>
      <Text style={{ fontSize: 6, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 3, textAlign: 'center' }}>{label}</Text>
    </View>
  )
}

export function SummaryPage({ data, company, meta }) {
  const trip = data.trip || {}
  const nights = trip.startDate && trip.endDate
    ? Math.round((new Date(trip.endDate) - new Date(trip.startDate)) / 86400000) : 0
  const countries = (trip.countries || '').split(',').map(c => c.trim()).filter(Boolean)
  const cities = (trip.cities || '').split(',').map(c => c.trim()).filter(Boolean)
  const hotels = data.hotels || []
  const flights = data.flights || []
  const itinerary = data.itinerary || []
  const totalActivities = itinerary.reduce((s, d) => s + (d.activities?.length || 0), 0)

  const purposeLabel = { turismo: 'Turismo', negocios: 'Negocios', 'visita familiar': 'Visita Familiar', 'luna de miel': 'Luna de Miel', estudios: 'Estudios', evento: 'Evento', otro: 'Otro' }

  return (
    <PageWrapper company={company} {...meta}>
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Resumen Ejecutivo del Viaje</Text>

        {/* Title */}
        <View style={{ backgroundColor: NAVY, borderRadius: 6, padding: 16, marginBottom: 16 }}>
          <Text style={{ fontSize: 7, color: '#93c5fd', letterSpacing: 2, marginBottom: 4 }}>ITINERARIO OFICIAL</Text>
          <Text style={{ fontSize: 17, color: '#fff', fontFamily: 'Helvetica-Bold', marginBottom: 6 }}>{trip.title || '—'}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
            {cities.map((c, i) => (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 8, color: GOLD, fontFamily: 'Helvetica-Bold' }}>{c}</Text>
                {i < cities.length - 1 && <Text style={{ fontSize: 9, color: '#93c5fd', marginHorizontal: 4 }}>→</Text>}
              </View>
            ))}
          </View>
        </View>

        {/* Stats */}
        <View style={{ flexDirection: 'row', marginBottom: 16 }}>
          <StatBox value={nights + 1} label="Días" color={NAVY} />
          <StatBox value={nights} label="Noches" color={NAVY} />
          <StatBox value={countries.length} label="Países" color={GOLD} />
          <StatBox value={cities.length} label="Ciudades" color={GOLD} />
          <StatBox value={hotels.length} label="Hoteles" color={GREEN} />
          <StatBox value={flights.length} label="Vuelos" color='#6366f1' />
          <StatBox value={totalActivities} label="Actividades" color='#f59e0b' />
        </View>

        {/* Two columns */}
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {/* Left */}
          <View style={{ flex: 1 }}>
            <View style={styles.card}>
              <Text style={styles.sectionSubtitle}>Información del viaje</Text>
              {[
                ['Motivo', purposeLabel[trip.tripPurpose] || trip.tripPurpose || '—'],
                ['Tipo', trip.tripType || '—'],
                ['Moneda', trip.currency || '—'],
                ['Idioma', trip.language || '—'],
                ['Estado', 'Confirmado'],
              ].map(([label, value]) => (
                <View key={label} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' }}>
                  <Text style={styles.label}>{label}</Text>
                  <Text style={[styles.value, { textAlign: 'right' }]}>{value}</Text>
                </View>
              ))}
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionSubtitle}>Fechas del viaje</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 }}>
                <View>
                  <Text style={styles.label}>Salida</Text>
                  <Text style={styles.value}>{trip.startDate ? new Date(trip.startDate + 'T12:00:00').toLocaleDateString('es-EC', { day: '2-digit', month: 'long', year: 'numeric' }) : '—'}</Text>
                </View>
                <Text style={{ fontSize: 14, color: GOLD }}>→</Text>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.label}>Regreso</Text>
                  <Text style={styles.value}>{trip.endDate ? new Date(trip.endDate + 'T12:00:00').toLocaleDateString('es-EC', { day: '2-digit', month: 'long', year: 'numeric' }) : '—'}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Right */}
          <View style={{ flex: 1 }}>
            <View style={styles.card}>
              <Text style={styles.sectionSubtitle}>Países visitados</Text>
              {countries.map((c, i) => (
                <View key={i} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' }}>
                  <Text style={{ fontSize: 8, color: GOLD, marginRight: 6 }}>●</Text>
                  <Text style={styles.valueNormal}>{c}</Text>
                </View>
              ))}
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionSubtitle}>Alojamientos</Text>
              {hotels.map((h, i) => (
                <View key={i} style={{ paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' }}>
                  <Text style={styles.value}>{h.name}</Text>
                  <Text style={styles.label}>{h.city} · {h.checkin} → {h.checkout}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {trip.notes && (
          <View style={{ padding: 10, backgroundColor: '#F8FAFC', borderRadius: 4, borderLeftWidth: 3, borderLeftColor: GOLD }}>
            <Text style={styles.label}>Observaciones generales</Text>
            <Text style={styles.valueNormal}>{trip.notes}</Text>
          </View>
        )}
      </View>
    </PageWrapper>
  )
}
