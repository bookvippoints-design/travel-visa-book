import { Page, View, Text, Image, Rect, Svg } from '@react-pdf/renderer'
import { NAVY, GOLD, WHITE } from '../styles'

export function CoverPage({ data, company }) {
  const trip = data.trip || {}
  const passenger = data.passengers?.[0] || {}
  const nights = trip.startDate && trip.endDate
    ? Math.round((new Date(trip.endDate) - new Date(trip.startDate)) / 86400000)
    : 0

  const coverImage = 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=900&q=80'

  return (
    <Page size="A4" style={{ fontFamily: 'Helvetica', backgroundColor: NAVY }}>
      {/* Background image */}
      <Image
        src={coverImage}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.18 }}
      />

      {/* Top bar */}
      <View style={{ backgroundColor: 'rgba(0,0,0,0.4)', paddingHorizontal: 40, paddingVertical: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        {company?.logo_url
          ? <Image src={company.logo_url} style={{ width: 90, height: 36, objectFit: 'contain' }} />
          : <Text style={{ color: WHITE, fontSize: 14, fontFamily: 'Helvetica-Bold' }}>{company?.commercial_name || 'Demo Visas'}</Text>
        }
        <Text style={{ color: '#93c5fd', fontSize: 8, letterSpacing: 3, textTransform: 'uppercase' }}>
          TRAVEL VISA BOOK
        </Text>
      </View>

      {/* Center content */}
      <View style={{ flex: 1, paddingHorizontal: 40, paddingVertical: 30, justifyContent: 'center' }}>
        {/* Gold accent line */}
        <View style={{ width: 50, height: 3, backgroundColor: GOLD, marginBottom: 20 }} />

        <Text style={{ fontSize: 9, color: '#93c5fd', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 10 }}>
          ITINERARIO DE VIAJE OFICIAL
        </Text>

        <Text style={{ fontSize: 28, color: WHITE, fontFamily: 'Helvetica-Bold', lineHeight: 1.2, marginBottom: 8 }}>
          {trip.title || 'Europa Clásica'}
        </Text>

        <Text style={{ fontSize: 12, color: GOLD, fontFamily: 'Helvetica-Bold', marginBottom: 24 }}>
          {trip.countries || 'España · Francia · Italia'}
        </Text>

        {/* Route visual */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 30, flexWrap: 'wrap', gap: 4 }}>
          {(trip.cities || 'Madrid, Barcelona, París, Roma').split(',').map((city, i, arr) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 9, color: WHITE, fontFamily: 'Helvetica-Bold' }}>{city.trim()}</Text>
              {i < arr.length - 1 && (
                <Text style={{ fontSize: 9, color: GOLD, marginHorizontal: 4 }}>→</Text>
              )}
            </View>
          ))}
        </View>

        {/* Stats row */}
        <View style={{ flexDirection: 'row', gap: 0, marginBottom: 30 }}>
          {[
            { label: 'DÍAS', value: nights + 1 },
            { label: 'NOCHES', value: nights },
            { label: 'PAÍSES', value: (trip.countries || '').split(',').length },
            { label: 'HOTELES', value: (data.hotels || []).length },
            { label: 'VUELOS', value: (data.flights || []).length },
          ].map((stat, i) => (
            <View key={i} style={{ flex: 1, alignItems: 'center', paddingVertical: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', backgroundColor: 'rgba(255,255,255,0.08)', marginRight: i < 4 ? 1 : 0 }}>
              <Text style={{ fontSize: 20, color: GOLD, fontFamily: 'Helvetica-Bold' }}>{stat.value}</Text>
              <Text style={{ fontSize: 6, color: '#93c5fd', letterSpacing: 1, marginTop: 3 }}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Passenger info */}
        <View style={{ borderLeftWidth: 3, borderLeftColor: GOLD, paddingLeft: 14, marginBottom: 20 }}>
          <Text style={{ fontSize: 7, color: '#93c5fd', letterSpacing: 1, marginBottom: 4 }}>PASAJERO</Text>
          <Text style={{ fontSize: 14, color: WHITE, fontFamily: 'Helvetica-Bold' }}>{passenger.name || '—'}</Text>
          <Text style={{ fontSize: 9, color: '#bfdbfe', marginTop: 3 }}>
            {passenger.nationality || ''}{passenger.passportNumber ? ` · Pasaporte: ${passenger.passportNumber}` : ''}
          </Text>
        </View>

        {/* Dates */}
        <View style={{ flexDirection: 'row', gap: 20 }}>
          <View>
            <Text style={{ fontSize: 7, color: '#93c5fd', letterSpacing: 1, marginBottom: 3 }}>SALIDA</Text>
            <Text style={{ fontSize: 11, color: WHITE, fontFamily: 'Helvetica-Bold' }}>
              {trip.startDate ? new Date(trip.startDate + 'T12:00:00').toLocaleDateString('es-EC', { day: '2-digit', month: 'long', year: 'numeric' }) : '—'}
            </Text>
          </View>
          <Text style={{ fontSize: 14, color: GOLD, alignSelf: 'flex-end', marginBottom: 2 }}>→</Text>
          <View>
            <Text style={{ fontSize: 7, color: '#93c5fd', letterSpacing: 1, marginBottom: 3 }}>REGRESO</Text>
            <Text style={{ fontSize: 11, color: WHITE, fontFamily: 'Helvetica-Bold' }}>
              {trip.endDate ? new Date(trip.endDate + 'T12:00:00').toLocaleDateString('es-EC', { day: '2-digit', month: 'long', year: 'numeric' }) : '—'}
            </Text>
          </View>
        </View>
      </View>

      {/* Bottom bar */}
      <View style={{ backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 40, paddingVertical: 14, flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ fontSize: 7, color: '#64748b' }}>Expediente: {trip.expeditionCode || '—'}</Text>
        <Text style={{ fontSize: 7, color: '#64748b' }}>Emisión: {trip.emissionDate || new Date().toLocaleDateString('es-EC')}</Text>
        <Text style={{ fontSize: 7, color: '#64748b' }}>{company?.commercial_name || 'Demo Visas'} · {company?.website || ''}</Text>
      </View>
    </Page>
  )
}
