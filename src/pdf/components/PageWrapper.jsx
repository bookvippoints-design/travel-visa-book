import { Page, View, Text, Image } from '@react-pdf/renderer'
import { makeStyles, WHITE } from '../styles'

export function PageWrapper({ children, company, expeditionCode, emissionDate, pageNumber, totalPages }) {
  const primary = company?.primary_color || '#1A3F7A'
  const secondary = company?.secondary_color || '#B8860B'
  const S = makeStyles(primary, secondary)

  return (
    <Page size="A4" style={S.page}>
      {/* Header */}
      <View style={S.pageHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {company?.logo_url
            ? <Image src={company.logo_url} style={S.headerLogo} />
            : <Text style={{ fontSize: 11, color: '#fff', fontFamily: 'Helvetica-Bold' }}>
                {company?.commercial_name || 'Travel Visa Book'}
              </Text>
          }
        </View>
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 7, color: 'rgba(255,255,255,0.8)', letterSpacing: 2 }}>TRAVEL VISA BOOK</Text>
          <Text style={{ fontSize: 6, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>Documentos de Viaje Profesionales</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={S.headerRight}>Exp: {expeditionCode || '—'}</Text>
          <Text style={[S.headerRight, { marginTop: 2 }]}>Emisión: {emissionDate || new Date().toLocaleDateString('es-EC')}</Text>
        </View>
      </View>

      {/* Content */}
      <View style={{ flex: 1, paddingBottom: 28 }}>
        {children}
      </View>

      {/* Footer */}
      <View style={S.pageFooter}>
        <Text style={S.footerText}>
          {company?.commercial_name || ''} · {company?.phone || ''} · {company?.email || ''}
        </Text>
        <Text style={S.footerText}>{company?.website || ''}</Text>
        <Text style={S.footerPage}>Página {pageNumber} de {totalPages}</Text>
      </View>
    </Page>
  )
}
