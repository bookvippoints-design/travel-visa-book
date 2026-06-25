import { Page, View, Text, Image } from '@react-pdf/renderer'

export function CoverPage({ data, company }) {
  const primary = company?.primary_color || '#1A3F7A'
  const secondary = company?.secondary_color || '#B8860B'
  const BORDER = '#E2E8F0'

  const trip = data.trip || {}
  const passenger = data.passengers?.[0] || {}
  const nights = trip.startDate && trip.endDate
    ? Math.round((new Date(trip.endDate) - new Date(trip.startDate)) / 86400000) : 0
  const cities = (trip.cities || '').split(',').map(c => c.trim()).filter(Boolean)
  const countries = (trip.countries || '').split(',').map(c => c.trim()).filter(Boolean)

  return (
    <Page size="A4" style={{ fontFamily: 'Helvetica', backgroundColor: '#FFFFFF' }}>
      <View style={{ height: 6, backgroundColor: secondary }} />
      <View style={{ height: 2, backgroundColor: primary }} />

      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 60 }}>

        {/* Logo */}
        <View style={{ alignItems: 'center', marginBottom: 40 }}>
          {company?.logo_url
            ? <Image src={company.logo_url} style={{ width: 200, height: 100, objectFit: 'contain' }} />
            : <Text style={{ fontSize: 28, color: primary, fontFamily: 'Helvetica-Bold', textAlign: 'center' }}>
                {company?.commercial_name || 'Travel Visa Book'}
              </Text>
          }
        </View>

        <View style={{ width: 60, height: 2, backgroundColor: secondary, marginBottom: 32 }} />

        <Text style={{ fontSize: 8, color: '#94a3b8', letterSpacing: 3, marginBottom: 14 }}>
          TRAVEL VISA BOOK · ITINERARIO OFICIAL
        </Text>

        <Text style={{ fontSize: 22, color: primary, fontFamily: 'Helvetica-Bold', textAlign: 'center', lineHeight: 1.3, marginBottom: 10 }}>
          {trip.title || 'Itinerario de Viaje'}
        </Text>

        <Text style={{ fontSize: 13, color: secondary, fontFamily: 'Helvetica-Bold', textAlign: 'center', marginBottom: 32 }}>
          {countries.join(' · ')}
        </Text>

        {cities.length > 0 && (
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', marginBottom: 36, gap: 4 }}>
            {cities.map((city, i) => (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 9, color: '#475569', fontFamily: 'Helvetica-Bold' }}>{city}</Text>
                {i < cities.length - 1 && <Text style={{ fontSize: 10, color: secondary, marginHorizontal: 5 }}>→</Text>}
              </View>
            ))}
          </View>
        )}

        {/* Stats */}
        <View style={{ flexDirection: 'row', borderWidth: 1, borderColor: BORDER, borderRadius: 6, overflow: 'hidden', marginBottom: 40, width: '100%' }}>
          {[
            { label: 'DÍAS', value: nights + 1 },
            { label: 'NOCHES', value: nights },
            { label: 'PAÍSES', value: countries.length },
            { label: 'HOTELES', value: (data.hotels || []).length },
            { label: 'VUELOS', value: (data.flights || []).length },
          ].map((s, i, arr) => (
            <View key={i} style={{ flex: 1, alignItems: 'center', paddingVertical: 14, borderRightWidth: i < arr.length - 1 ? 1 : 0, borderRightColor: BORDER }}>
              <Text style={{ fontSize: 22, color: primary, fontFamily: 'Helvetica-Bold' }}>{s.value}</Text>
              <Text style={{ fontSize: 6, color: '#94a3b8', letterSpacing: 1, marginTop: 4 }}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Passenger */}
        <View style={{ borderLeftWidth: 3, borderLeftColor: secondary, paddingLeft: 14, alignSelf: 'flex-start', marginBottom: 20 }}>
          <Text style={{ fontSize: 7, color: '#94a3b8', letterSpacing: 1, marginBottom: 4 }}>PASAJERO</Text>
          <Text style={{ fontSize: 16, color: primary, fontFamily: 'Helvetica-Bold' }}>{passenger.name || '—'}</Text>
          {(passenger.nationality || passenger.passportNumber) && (
            <Text style={{ fontSize: 8, color: '#64748b', marginTop: 3 }}>
              {passenger.nationality || ''}{passenger.passportNumber ? ` · Pasaporte: ${passenger.passportNumber}` : ''}
            </Text>
          )}
        </View>

        {/* Dates */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20, alignSelf: 'flex-start' }}>
          <View>
            <Text style={{ fontSize: 7, color: '#94a3b8', letterSpacing: 1, marginBottom: 3 }}>SALIDA</Text>
            <Text style={{ fontSize: 12, color: primary, fontFamily: 'Helvetica-Bold' }}>
              {trip.startDate ? new Date(trip.startDate + 'T12:00:00').toLocaleDateString('es-EC', { day: '2-digit', month: 'long', year: 'numeric' }) : '—'}
            </Text>
          </View>
          <Text style={{ fontSize: 18, color: secondary, marginTop: 8 }}>→</Text>
          <View>
            <Text style={{ fontSize: 7, color: '#94a3b8', letterSpacing: 1, marginBottom: 3 }}>REGRESO</Text>
            <Text style={{ fontSize: 12, color: primary, fontFamily: 'Helvetica-Bold' }}>
              {trip.endDate ? new Date(trip.endDate + 'T12:00:00').toLocaleDateString('es-EC', { day: '2-digit', month: 'long', year: 'numeric' }) : '—'}
            </Text>
          </View>
        </View>
      </View>

      {/* Footer */}
      <View style={{ borderTopWidth: 1, borderTopColor: BORDER, paddingHorizontal: 40, paddingVertical: 12, flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ fontSize: 7, color: '#94a3b8' }}>Exp: {trip.expeditionCode || '—'}</Text>
        <Text style={{ fontSize: 7, color: '#94a3b8' }}>{company?.commercial_name || '—'}</Text>
        <Text style={{ fontSize: 7, color: '#94a3b8' }}>Emisión: {trip.emissionDate ? new Date(trip.emissionDate + 'T12:00:00').toLocaleDateString('es-EC') : new Date().toLocaleDateString('es-EC')}</Text>
      </View>

      <View style={{ height: 2, backgroundColor: primary }} />
      <View style={{ height: 6, backgroundColor: secondary }} />
    </Page>
  )
}
