import { View, Text } from '@react-pdf/renderer'
import { PageWrapper } from '../components/PageWrapper'
import { styles, NAVY, GOLD, LIGHT_BLUE, BORDER } from '../styles'

function Field({ label, value, flex = 1 }) {
  return (
    <View style={{ flex, marginRight: 8, marginBottom: 10 }}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value || '—'}</Text>
    </View>
  )
}

export function PassengerPage({ data, company, meta }) {
  const primary = company?.primary_color || '#1A3F7A'
  const secondary = company?.secondary_color || '#B8860B'
  const styles = makeStyles(primary, secondary)
  const NAVY = primary
  const GOLD = secondary
  const LIGHT_BLUE = '#EFF6FF'
  const WHITE = '#FFFFFF'
  const BORDER = '#E2E8F0'
  const passengers = data.passengers || []

  return (
    <PageWrapper company={company} {...meta}>
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Datos del Pasajero</Text>

        {passengers.map((p, i) => (
          <View key={i} style={{ marginBottom: 16 }}>
            {passengers.length > 1 && (
              <Text style={{ fontSize: 9, color: NAVY, fontFamily: 'Helvetica-Bold', marginBottom: 8 }}>
                Pasajero {i + 1}
              </Text>
            )}

            {/* Name banner */}
            <View style={{ backgroundColor: NAVY, borderRadius: 4, padding: 12, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <Text style={{ fontSize: 7, color: '#93c5fd', letterSpacing: 1, marginBottom: 3 }}>NOMBRE COMPLETO</Text>
                <Text style={{ fontSize: 15, color: '#fff', fontFamily: 'Helvetica-Bold' }}>{p.name || '—'}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ fontSize: 7, color: '#93c5fd', letterSpacing: 1, marginBottom: 3 }}>PASAPORTE</Text>
                <Text style={{ fontSize: 13, color: GOLD, fontFamily: 'Helvetica-Bold' }}>{p.passportNumber || '—'}</Text>
              </View>
            </View>

            {/* Personal data */}
            <View style={styles.card}>
              <Text style={{ fontSize: 8, color: NAVY, fontFamily: 'Helvetica-Bold', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
                Información Personal
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                <Field label="Nacionalidad" value={p.nationality} />
                <Field label="Fecha de nacimiento" value={p.birthDate ? new Date(p.birthDate + 'T12:00:00').toLocaleDateString('es-EC') : '—'} />
                <Field label="Ocupación" value={p.occupation} />
                <Field label="Empresa" value={p.employer} />
              </View>
              <View style={styles.divider} />
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                <Field label="Correo electrónico" value={p.email} flex={2} />
                <Field label="Teléfono" value={p.phone} />
              </View>
              <Field label="Dirección de residencia" value={p.address} flex={0} />
            </View>

            {/* Passport */}
            <View style={[styles.cardBlue, { flexDirection: 'row', justifyContent: 'space-between' }]}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 8, color: NAVY, fontFamily: 'Helvetica-Bold', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
                  Datos del Pasaporte
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  <Field label="Número de pasaporte" value={p.passportNumber} />
                  <Field label="País emisor" value={p.passportIssuer} />
                  <Field label="Fecha de vencimiento" value={p.passportExpiry ? new Date(p.passportExpiry + 'T12:00:00').toLocaleDateString('es-EC') : '—'} />
                </View>
              </View>
            </View>

            {/* Emergency */}
            {(p.emergencyContact || p.emergencyPhone) && (
              <View style={[styles.cardGold]}>
                <Text style={{ fontSize: 8, color: '#92400E', fontFamily: 'Helvetica-Bold', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>
                  Contacto de Emergencia
                </Text>
                <View style={{ flexDirection: 'row' }}>
                  <Field label="Nombre" value={p.emergencyContact} />
                  <Field label="Teléfono" value={p.emergencyPhone} />
                </View>
              </View>
            )}

            {p.notes && (
              <View style={{ padding: 8, backgroundColor: '#F8FAFC', borderRadius: 4, borderLeftWidth: 3, borderLeftColor: NAVY }}>
                <Text style={styles.label}>Observaciones</Text>
                <Text style={styles.valueNormal}>{p.notes}</Text>
              </View>
            )}
          </View>
        ))}
      </View>
    </PageWrapper>
  )
}
