import { View, Text, Image } from '@react-pdf/renderer'
import { PageWrapper } from '../components/PageWrapper'
import { styles, NAVY, GOLD, WHITE, BORDER } from '../styles'

export function DeclarationPage({ data, company, meta }) {
  const decl = data.declaration || {}
  const trip = data.trip || {}
  const passenger = data.passengers?.[0] || {}
  const today = new Date().toLocaleDateString('es-EC', { day: '2-digit', month: 'long', year: 'numeric' })

  const defaultText = `El presente documento ha sido elaborado por ${company?.commercial_name || 'la agencia'} con fines informativos y de planificación turística, como respaldo del itinerario propuesto para el pasajero. La información contenida en este documento corresponde a los datos proporcionados por el cliente y/o a las reservas, servicios y actividades planificadas al momento de su emisión. Las actividades, horarios, alojamientos, transportes y servicios pueden estar sujetos a modificaciones por razones operativas, disponibilidad, cambios de proveedor, clima, fuerza mayor o disposiciones migratorias.\n\nEste documento no constituye garantía de aprobación de visa ni garantía de ingreso a ningún país. La decisión final corresponde exclusivamente a las autoridades consulares y migratorias competentes.`

  return (
    <PageWrapper company={company} {...meta}>
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Declaración Final</Text>

        {/* Document info */}
        <View style={[styles.cardBlue, { marginBottom: 14 }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View>
              <Text style={styles.label}>Pasajero</Text>
              <Text style={styles.value}>{passenger.name || '—'}</Text>
            </View>
            <View>
              <Text style={styles.label}>Pasaporte</Text>
              <Text style={styles.value}>{passenger.passportNumber || '—'}</Text>
            </View>
            <View>
              <Text style={styles.label}>Destino</Text>
              <Text style={styles.value}>{trip.title || '—'}</Text>
            </View>
            <View>
              <Text style={styles.label}>Expediente</Text>
              <Text style={styles.value}>{trip.expeditionCode || '—'}</Text>
            </View>
          </View>
        </View>

        {/* Declaration text */}
        <View style={{ borderWidth: 1, borderColor: BORDER, borderRadius: 4, padding: 16, marginBottom: 20, backgroundColor: '#FAFAFA' }}>
          <Text style={{ fontSize: 7, color: '#94a3b8', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 }}>
            DECLARACIÓN OFICIAL
          </Text>
          <Text style={{ fontSize: 9, color: '#374151', lineHeight: 1.7 }}>
            {decl.customText || defaultText}
          </Text>
        </View>

        {/* Signature area */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
          {/* Agency signature */}
          <View style={{ flex: 1, alignItems: 'center', marginRight: 20 }}>
            <View style={{ width: '100%', borderBottomWidth: 1, borderBottomColor: NAVY, marginBottom: 6, height: 50, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 4 }}>
              {company?.signature_url && (
                <Image src={company.signature_url} style={{ width: 80, height: 35, objectFit: 'contain' }} />
              )}
            </View>
            <Text style={{ fontSize: 8, color: NAVY, fontFamily: 'Helvetica-Bold', textAlign: 'center' }}>
              {decl.responsibleName || company?.commercial_name || '—'}
            </Text>
            <Text style={{ fontSize: 7, color: '#64748b', textAlign: 'center', marginTop: 2 }}>
              {company?.commercial_name || '—'}
            </Text>
            <Text style={{ fontSize: 7, color: '#94a3b8', textAlign: 'center', marginTop: 1 }}>
              Asesor de Viajes Autorizado
            </Text>
          </View>

          {/* Stamp area */}
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={{ width: '100%', borderWidth: 1, borderColor: BORDER, borderStyle: 'dashed', height: 56, alignItems: 'center', justifyContent: 'center', marginBottom: 6, borderRadius: 4 }}>
              {company?.stamp_url
                ? <Image src={company.stamp_url} style={{ width: 50, height: 50, objectFit: 'contain' }} />
                : <Text style={{ fontSize: 7, color: '#cbd5e1' }}>SELLO OFICIAL</Text>
              }
            </View>
            <Text style={{ fontSize: 7, color: '#64748b', textAlign: 'center' }}>Sello de la Agencia</Text>
          </View>
        </View>

        {/* Emission date */}
        <View style={{ alignItems: 'center', marginTop: 20, paddingTop: 12, borderTopWidth: 1, borderTopColor: BORDER }}>
          <Text style={{ fontSize: 8, color: '#64748b' }}>
            Emitido en Quito, Ecuador, el {trip.emissionDate ? new Date(trip.emissionDate + 'T12:00:00').toLocaleDateString('es-EC', { day: '2-digit', month: 'long', year: 'numeric' }) : today}
          </Text>
        </View>

        {/* Agency footer info */}
        <View style={{ backgroundColor: NAVY, borderRadius: 4, padding: 12, marginTop: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={{ fontSize: 9, color: WHITE, fontFamily: 'Helvetica-Bold' }}>
              {company?.commercial_name || 'Demo Visas'}
            </Text>
            <Text style={{ fontSize: 7, color: '#93c5fd', marginTop: 2 }}>{company?.address || ''}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 8, color: GOLD }}>{company?.phone || ''}</Text>
            <Text style={{ fontSize: 7, color: '#93c5fd', marginTop: 2 }}>{company?.website || ''}</Text>
          </View>
        </View>
      </View>
    </PageWrapper>
  )
}
