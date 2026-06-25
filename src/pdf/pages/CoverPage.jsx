import { Page, View, Text, Image } from '@react-pdf/renderer'
import { NAVY, GOLD, BORDER } from '../styles'

export function CoverPage({ data, company }) {
  const trip = data.trip || {}
  const passenger = data.passengers?.[0] || {}
  const nights = trip.startDate && trip.endDate
    ? Math.round((new Date(trip.endDate) - new Date(trip.startDate)) / 86400000) : 0
  const cities = (trip.cities || '').split(',').map(c => c.trim()).filter(Boolean)
  const countries = (trip.countries || '').split(',').map(c => c.trim()).filter(Boolean)

  return (
    <Page size="A4" style={{ fontFamily: 'Helvetica', backgroundColor: '#FFFFFF' }}>

      {/* Gold top accent line */}
      <View style={{ height: 5, backgroundColor: GOLD }} />

      {/* Navy thin line below gold */}
      <View style={{ height: 2, backgroundColor: NAVY }} />

      {/* Main content — centered vertically */}
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 60 }}>

        {/* Logo */}
        <View style={{ alignItems: 'center', marginBottom: 36 }}>
          {company?.logo_url
            ? <Image
                src={company.logo_url}
                style={{ width: 180, maxHeight: 90, objectFit: 'contain' }}
              />
            : <Text style={{ fontSize: 26, color: NAVY, fontFamily: 'Helvetica-Bold' }}>
                {company?.commercial_name || 'Travel Visa Book'}
              </Text>
          }
        </View>

        {/* Divider gold */}
        <View style={{ width: 60, height: 2, backgroundColor: GOLD, marginBottom: 32 }} />

        {/* Document label */}
        <Text style={{ fontSize: 9, color: '#94a3b8', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 12 }}>
          TRAVEL VISA BOOK
        </Text>

        {/* Trip title */}
        <Text style={{ fontSize: 22, color: NAVY, fontFamily: 'Helvetica-Bold', textAlign: 'center', lineHeight: 1.3, marginBottom: 8 }}>
          {trip.title || 'Itinerario de Viaje'}
        </Text>

        {/* Countries */}
        <Text style={{ fontSize: 12, color: GOLD, fontFamily: 'Helvetica-Bold', textAlign: 'center', marginBottom: 32 }}>
          {countries.join(' · ')}
        </Text>

        {/* Route */}
        {cities.length > 0 && (
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', marginBottom: 36, gap: 4 }}>
            {cities.map((city, i) => (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 9, color: '#475569', fontFamily: 'Helvetica-Bold' }}>{city}</Text>
                {i < cities.length - 1 && (
                  <Text style={{ fontSize: 10, color: GOLD, marginHorizontal: 5 }}>→</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Stats row */}
        <View style={{ flexDirection: 'row', borderWidth: 1, borderColor: BORDER, borderRadius: 6, overflow: 'hidden', marginBottom: 36 }}>
          {[
            { label: 'DÍAS',      value: nights + 1 },
            { label: 'NOCHES',    value: nights },
            { label: 'PAÍSES',    value: countries.length },
            { label: 'HOTELES',   value: (data.hotels || []).length },
            { label: 'VUELOS',    value: (data.flights || []).length },
          ].map((s, i, arr) => (
            <View key={i} style={{
              flex: 1, alignItems: 'center', paddingVertical: 12,
              borderRightWidth: i < arr.length - 1 ? 1 : 0,
              borderRightColor: BORDER
            }}>
              <Text style={{ fontSize: 20, color: NAVY, fontFamily: 'Helvetica-Bold' }}>{s.value}</Text>
              <Text style={{ fontSize: 6, color: '#94a3b8', letterSpacing: 1, marginTop: 3 }}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Passenger block */}
        <View style={{ borderLeftWidth: 3, borderLeftColor: GOLD, paddingLeft: 14, alignSelf: 'flex-start', marginBottom: 6 }}>
          <Text style={{ fontSize: 7, color: '#94a3b8', letterSpacing: 1, marginBottom: 3 }}>PASAJERO</Text>
          <Text style={{ fontSize: 15, color: NAVY, fontFamily: 'Helvetica-Bold' }}>
            {passenger.name || '—'}
          </Text>
          {passenger.passportNumber && (
            <Text style={{ fontSize: 8, color: '#64748b', marginTop: 2 }}>
              {passenger.nationality || ''}{passenger.passportNumber ? ` · Pasaporte: ${passenger.passportNumber}` : ''}
            </Text>
          )}
        </View>

        {/* Dates */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, alignSelf: 'flex-start', marginTop: 16 }}>
          <View>
            <Text style={{ fontSize: 7, color: '#94a3b8', letterSpacing: 1, marginBottom: 3 }}>SALIDA</Text>
            <Text style={{ fontSize: 11, color: NAVY, fontFamily: 'Helvetica-Bold' }}>
              {trip.startDate
                ? new Date(trip.startDate + 'T12:00:00').toLocaleDateString('es-EC', { day: '2-digit', month: 'long', year: 'numeric' })
                : '—'}
            </Text>
          </View>
          <Text style={{ fontSize: 16, color: GOLD }}>→</Text>
          <View>
            <Text style={{ fontSize: 7, color: '#94a3b8', letterSpacing: 1, marginBottom: 3 }}>REGRESO</Text>
            <Text style={{ fontSize: 11, color: NAVY, fontFamily: 'Helvetica-Bold' }}>
              {trip.endDate
                ? new Date(trip.endDate + 'T12:00:00').toLocaleDateString('es-EC', { day: '2-digit', month: 'long', year: 'numeric' })
                : '—'}
            </Text>
          </View>
        </View>

      </View>

      {/* Bottom footer */}
      <View style={{ borderTopWidth: 1, borderTopColor: BORDER, paddingHorizontal: 40, paddingVertical: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontSize: 7, color: '#94a3b8' }}>
          Expediente: {trip.expeditionCode || '—'}
        </Text>
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 7, color: '#94a3b8' }}>
            {company?.commercial_name || '—'}
          </Text>
          {company?.website && (
            <Text style={{ fontSize: 7, color: '#cbd5e1', marginTop: 1 }}>{company.website}</Text>
          )}
        </View>
        <Text style={{ fontSize: 7, color: '#94a3b8' }}>
          Emisión: {trip.emissionDate
            ? new Date(trip.emissionDate + 'T12:00:00').toLocaleDateString('es-EC')
            : new Date().toLocaleDateString('es-EC')}
        </Text>
      </View>

      {/* Gold bottom accent */}
      <View style={{ height: 2, backgroundColor: NAVY }} />
      <View style={{ height: 5, backgroundColor: GOLD }} />

    </Page>
  )
}
