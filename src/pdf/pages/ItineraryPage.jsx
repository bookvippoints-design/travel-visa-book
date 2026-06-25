import { View, Text } from '@react-pdf/renderer'
import { PageWrapper } from '../components/PageWrapper'
import { styles, NAVY, GOLD, WHITE, GREEN } from '../styles'

function DayCard({ day }) {
  return (
    <View style={{ marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 4, overflow: 'hidden' }}>
      {/* Day header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: NAVY, paddingHorizontal: 12, paddingVertical: 8 }}>
        <View style={{ width: 26, height: 26, backgroundColor: GOLD, borderRadius: 13, alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
          <Text style={{ fontSize: 11, color: WHITE, fontFamily: 'Helvetica-Bold' }}>{day.day}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 10, color: WHITE, fontFamily: 'Helvetica-Bold' }}>{day.title || `Día ${day.day}`}</Text>
          <Text style={{ fontSize: 7, color: '#93c5fd', marginTop: 1 }}>
            {day.date ? new Date(day.date + 'T12:00:00').toLocaleDateString('es-EC', { weekday: 'long', day: '2-digit', month: 'long' }) : ''} · {day.city}{day.country ? `, ${day.country}` : ''}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          {day.hotel && <Text style={{ fontSize: 7, color: '#93c5fd' }}>🏨 {day.hotel}</Text>}
          {day.meals && <Text style={{ fontSize: 7, color: '#93c5fd', marginTop: 2 }}>🍽 {day.meals}</Text>}
        </View>
      </View>

      {/* Day body */}
      <View style={{ padding: 10 }}>
        {day.description && (
          <Text style={{ fontSize: 8, color: '#475569', marginBottom: 8, lineHeight: 1.4 }}>{day.description}</Text>
        )}

        {/* Activities */}
        {(day.activities || []).length > 0 && (
          <View>
            {day.activities.map((act, i) => (
              <View key={i} style={{ flexDirection: 'row', marginBottom: 5, paddingLeft: 8, borderLeftWidth: 2, borderLeftColor: act.confirmed ? GREEN : GOLD }}>
                <View style={{ width: 36, marginRight: 8 }}>
                  <Text style={{ fontSize: 7, color: NAVY, fontFamily: 'Helvetica-Bold' }}>{act.time || ''}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 8, color: '#1e293b', fontFamily: 'Helvetica-Bold' }}>{act.name}</Text>
                  {act.place && <Text style={{ fontSize: 7, color: '#64748b', marginTop: 1 }}>📍 {act.place}</Text>}
                  {act.description && <Text style={{ fontSize: 7, color: '#94a3b8', marginTop: 1 }}>{act.description}</Text>}
                  {act.duration && <Text style={{ fontSize: 7, color: GOLD, marginTop: 1 }}>⏱ {act.duration}</Text>}
                </View>
                <View>
                  <Text style={{ fontSize: 6, color: act.confirmed ? '#065F46' : '#92400E', backgroundColor: act.confirmed ? '#D1FAE5' : '#FEF3C7', paddingHorizontal: 4, paddingVertical: 1, borderRadius: 3 }}>
                    {act.confirmed ? 'CONF' : 'PEND'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  )
}

export function ItineraryPage({ data, company, meta }) {
  const days = data.itinerary || []

  return (
    <PageWrapper company={company} {...meta}>
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Itinerario Día por Día</Text>

        {days.length === 0
          ? <Text style={{ color: '#94a3b8', fontSize: 9 }}>No hay días en el itinerario.</Text>
          : days.map((day, i) => <DayCard key={i} day={day} />)
        }
      </View>
    </PageWrapper>
  )
}
