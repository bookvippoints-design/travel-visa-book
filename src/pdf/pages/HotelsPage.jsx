import { View, Text, Image } from '@react-pdf/renderer'
import { PageWrapper } from '../components/PageWrapper'
import { styles, NAVY, GOLD, WHITE, LIGHT_BLUE, BORDER, GREEN } from '../styles'

const HOTEL_IMAGES = {
  'Madrid':    'https://images.unsplash.com/photo-1578894381163-e72c17f2d45f?w=400&q=70',
  'Barcelona': 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=400&q=70',
  'París':     'https://images.unsplash.com/photo-1431274172761-fca41d930114?w=400&q=70',
  'Roma':      'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400&q=70',
  'Florencia': 'https://images.unsplash.com/photo-1543429776-2782fc8e1acd?w=400&q=70',
  'Venecia':   'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=400&q=70',
}
const DEFAULT_IMG = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=70'

const regimeLabel = {
  'solo alojamiento': 'Solo alojamiento',
  'desayuno incluido': 'Desayuno incluido',
  'media pensión': 'Media pensión',
  'todo incluido': 'Todo incluido'
}

function HotelCard({ hotel }) {
  const nights = hotel.checkin && hotel.checkout
    ? Math.round((new Date(hotel.checkout) - new Date(hotel.checkin)) / 86400000) : 0
  const stars = parseInt(hotel.stars) || 0
  const img = HOTEL_IMAGES[hotel.city] || DEFAULT_IMG

  return (
    <View wrap={false} style={{ marginBottom: 12, borderWidth: 1, borderColor: BORDER, borderRadius: 6, overflow: 'hidden', flexDirection: 'row' }}>
      {/* Photo */}
      <Image
        src={img}
        style={{ width: 100, objectFit: 'cover' }}
      />

      {/* Info */}
      <View style={{ flex: 1, padding: 11 }}>
        {/* Hotel name + status */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 5 }}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={{ fontSize: 12, color: NAVY, fontFamily: 'Helvetica-Bold' }}>{hotel.name}</Text>
            <Text style={{ fontSize: 8, color: '#64748b', marginTop: 2 }}>
              {'★'.repeat(stars)}{'☆'.repeat(Math.max(0, 5 - stars))} · {hotel.city}, {hotel.country}
            </Text>
          </View>
          <View style={{ backgroundColor: '#D1FAE5', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 10 }}>
            <Text style={{ fontSize: 7, color: '#065F46', fontFamily: 'Helvetica-Bold' }}>
              {(hotel.status || 'confirmado').toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Dates row */}
        <View style={{ flexDirection: 'row', gap: 16, marginBottom: 6 }}>
          <View>
            <Text style={styles.label}>Check-in</Text>
            <Text style={styles.value}>
              {hotel.checkin ? new Date(hotel.checkin + 'T12:00:00').toLocaleDateString('es-EC') : '—'}
            </Text>
          </View>
          <View>
            <Text style={styles.label}>Check-out</Text>
            <Text style={styles.value}>
              {hotel.checkout ? new Date(hotel.checkout + 'T12:00:00').toLocaleDateString('es-EC') : '—'}
            </Text>
          </View>
          <View>
            <Text style={styles.label}>Noches</Text>
            <Text style={[styles.value, { color: GOLD }]}>{nights}</Text>
          </View>
          <View>
            <Text style={styles.label}>Habitación</Text>
            <Text style={styles.value}>{hotel.roomType || '—'}</Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 7, color: '#64748b' }}>
            🍽 {regimeLabel[hotel.regime] || hotel.regime || '—'}
          </Text>
          {hotel.reservationCode && (
            <Text style={{ fontSize: 7, color: NAVY, fontFamily: 'Helvetica-Bold' }}>
              Res: {hotel.reservationCode}
            </Text>
          )}
        </View>

        {hotel.address && (
          <Text style={{ fontSize: 7, color: '#94a3b8', marginTop: 4 }}>📍 {hotel.address}</Text>
        )}
        {hotel.notes && (
          <Text style={{ fontSize: 7, color: '#94a3b8', marginTop: 3, fontStyle: 'italic' }}>ℹ {hotel.notes}</Text>
        )}
      </View>
    </View>
  )
}

export function HotelsPage({ data, company, meta }) {
  const hotels = data.hotels || []
  const totalNights = hotels.reduce((sum, h) => {
    if (h.checkin && h.checkout)
      return sum + Math.round((new Date(h.checkout) - new Date(h.checkin)) / 86400000)
    return sum
  }, 0)

  // 3 hotels per page max (each card ~90px + margin)
  const pages = []
  for (let i = 0; i < Math.max(1, hotels.length); i += 3) {
    pages.push(hotels.slice(i, i + 3))
  }

  return pages.map((group, pageIdx) => (
    <PageWrapper key={pageIdx} company={company} {...meta} pageNumber={meta.pageNumber + pageIdx}>
      <View style={styles.content}>
        {pageIdx === 0 && (
          <>
            <Text style={styles.sectionTitle}>Alojamiento</Text>
            {/* Summary strip */}
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
              {[
                { label: 'Total hoteles', value: hotels.length },
                { label: 'Total noches', value: totalNights },
                { label: 'Ciudades', value: [...new Set(hotels.map(h => h.city))].length },
              ].map(({ label, value }) => (
                <View key={label} style={{ flex: 1, backgroundColor: LIGHT_BLUE, borderRadius: 4, padding: 10, alignItems: 'center' }}>
                  <Text style={{ fontSize: 18, color: NAVY, fontFamily: 'Helvetica-Bold' }}>{value}</Text>
                  <Text style={{ fontSize: 7, color: '#64748b', marginTop: 2 }}>{label}</Text>
                </View>
              ))}
            </View>
          </>
        )}
        {pageIdx > 0 && (
          <Text style={{ fontSize: 9, color: '#94a3b8', marginBottom: 12, fontStyle: 'italic' }}>
            Alojamiento (continuación)
          </Text>
        )}
        {group.map((h, i) => <HotelCard key={i} hotel={h} />)}
      </View>
    </PageWrapper>
  ))
}
