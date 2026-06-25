import { Page, View, Text, Image } from '@react-pdf/renderer'
import { styles, NAVY } from '../styles'

export function PageWrapper({ children, company, expeditionCode, emissionDate, pageNumber, totalPages }) {
  return (
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.pageHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {company?.logo_url
            ? <Image src={company.logo_url} style={styles.headerLogo} />
            : <Text style={{ fontSize: 11, color: '#fff', fontFamily: 'Helvetica-Bold' }}>
                {company?.commercial_name || 'Travel Visa Book'}
              </Text>
          }
        </View>
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 7, color: '#93c5fd', letterSpacing: 2, textTransform: 'uppercase' }}>
            TRAVEL VISA BOOK
          </Text>
          <Text style={{ fontSize: 6, color: '#bfdbfe', marginTop: 2 }}>
            Documentos de Viaje Profesionales
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.headerRight}>Exp: {expeditionCode || '—'}</Text>
          <Text style={[styles.headerRight, { marginTop: 2 }]}>
            Emisión: {emissionDate || new Date().toLocaleDateString('es-EC')}
          </Text>
        </View>
      </View>

      {/* Content */}
      <View style={{ flex: 1, paddingBottom: 28 }}>
        {children}
      </View>

      {/* Footer */}
      <View style={styles.pageFooter}>
        <Text style={styles.footerText}>
          {company?.commercial_name || 'Demo Visas'} · {company?.phone || ''} · {company?.email || ''}
        </Text>
        <Text style={styles.footerText}>
          {company?.website || ''}
        </Text>
        <Text style={styles.footerPage}>
          Página {pageNumber} de {totalPages}
        </Text>
      </View>
    </Page>
  )
}
