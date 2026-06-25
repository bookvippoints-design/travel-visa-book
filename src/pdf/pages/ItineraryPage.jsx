import { View, Text } from '@react-pdf/renderer'
import { PageWrapper } from '../components/PageWrapper'
import { styles, NAVY, GOLD, WHITE, GREEN, BORDER } from '../styles'

function DayCard({ day }) {
  return (
    <View wrap={false} style={{ marginBottom: 10, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 5, overflow: 'hidden' }}>
      {/* Day header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: NAVY, paddingHorizontal: 12, paddingVertical: 8 }}>
        <View style={{ width: 26, height: 26, backgroundColor: GOLD, borderRadius: 13, alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
          <Text style={{ fontSize: 11, color: WHITE, fontFamily: 'Helvetica-Bold' }}>{day.day}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 10, color: WHITE, fontFamily: 'Helvetica-Bold' }}>
            {day.title || `Día ${day.day}`}
          </Text>
          <Text style={{ fontSize: 7, color: '#93c5fd', marginTop: 1 }}>
            {day.date
              ? new Date(day.date + 'T12:00:00').toLocaleDateString('es-EC', { weekday: 'long', day: '2-digit', month: 'long' })
              : ''}
            {day.city ? ` · ${day.city}` : ''}
            {day.country ? `, ${day.country}` : ''}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end', gap: 2 }}>
          {day.hotel && (
            <Text style={{ fontSize: 7, color: '#93c5fd' }}>🏨 {day.hotel}</Text>
          )}
          {day.meals && (
            <Text style={{ fontSize: 7, color: '#bfdbfe' }}>🍽 {day.meals}</Text>
          )}
        </View>
      </View>

      {/* Body */}
      <View style={{ padding: 10, backgroundColor: '#FAFAFA' }}>
        {day.description && (
          <Text style={{ fontSize: 8, color: '#475569', marginBottom: 8, lineHeight: 1.5 }}>
            {day.description}
          </Text>
        )}

        {/* Activities */}
        {(day.activities || []).map((act, i) => (
          <View key={i} style={{
            flexDirection: 'row',
            marginBottom: 5,
            paddingLeft: 8,
            paddingVertical: 4,
            borderLeftWidth: 2,
            borderLeftColor: act.confirmed ? GREEN : GOLD,
            backgroundColor: WHITE,
            borderRadius: 3,
          }}>
            <View style={{ width: 36, marginRight: 8, flexShrink: 0 }}>
              <Text style={{ fontSize: 7, color: NAVY, fontFamily: 'Helvetica-Bold' }}>{act.time || ''}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 8, color: '#1e293b', fontFamily: 'Helvetica-Bold' }}>{act.name}</Text>
              {act.place && (
                <Text style={{ fontSize: 7, color: '#64748b', marginTop: 1 }}>📍 {act.place}</Text>
              )}
              {act.description && (
                <Text style={{ fontSize: 7, color: '#94a3b8', marginTop: 1 }}>{act.description}</Text>
              )}
              {act.duration && (
                <Text style={{ fontSize: 7, color: GOLD, marginTop: 1 }}>⏱ {act.duration}</Text>
              )}
            </View>
            <View style={{ justifyContent: 'flex-start', paddingLeft: 6 }}>
              <View style={{
                backgroundColor: act.confirmed ? '#D1FAE5' : '#FEF3C7',
                paddingHorizontal: 5,
                paddingVertical: 2,
                borderRadius: 3,
              }}>
                <Text style={{ fontSize: 6, color: act.confirmed ? '#065F46' : '#92400E', fontFamily: 'Helvetica-Bold' }}>
                  {act.confirmed ? 'CONF' : 'PEND'}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  )
}

export function ItineraryPage({ data, company, meta }) {
  const days = data.itinerary || []

  // 2 days per page (each day card can be tall with many activities)
  const pages = []
  for (let i = 0; i < Math.max(1, days.length); i += 2) {
    pages.push(days.slice(i, i + 2))
  }

  return pages.map((group, pageIdx) => (
    <PageWrapper key={pageIdx} company={company} {...meta} pageNumber={meta.pageNumber + pageIdx}>
      <View style={styles.content}>
        {pageIdx === 0 && <Text style={styles.sectionTitle}>Itinerario Día por Día</Text>}
        {pageIdx > 0 && (
          <Text style={{ fontSize: 9, color: '#94a3b8', marginBottom: 12, fontStyle: 'italic' }}>
            Itinerario (continuación)
          </Text>
        )}
        {group.length === 0
          ? <Text style={{ color: '#94a3b8', fontSize: 9 }}>No hay días en el itinerario.</Text>
          : group.map((day, i) => <DayCard key={i} day={day} />)
        }
      </View>
    </PageWrapper>
  ))
}
