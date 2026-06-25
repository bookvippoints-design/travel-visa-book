import { StyleSheet } from '@react-pdf/renderer'

// Default colors — overridden per company
export const NAVY = '#1A3F7A'
export const GOLD = '#B8860B'
export const LIGHT_BLUE = '#EFF6FF'
export const GRAY = '#64748b'
export const LIGHT_GRAY = '#F8FAFC'
export const BORDER = '#E2E8F0'
export const GREEN = '#10b981'
export const WHITE = '#FFFFFF'

// Generate styles dynamically based on company colors
export function makeStyles(primary = NAVY, secondary = GOLD) {
  const lightPrimary = primary + '18' // ~10% opacity simulation via light bg
  return StyleSheet.create({
    page: { fontFamily: 'Helvetica', fontSize: 9, color: '#1e293b', backgroundColor: WHITE },
    section: { marginBottom: 16 },
    row: { flexDirection: 'row' },
    col2: { flex: 1 },

    pageHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 32, paddingVertical: 10, backgroundColor: primary, marginBottom: 0 },
    headerLogo: { width: 60, height: 24, objectFit: 'contain' },
    headerRight: { fontSize: 7, color: '#bfdbfe', textAlign: 'right' },

    pageFooter: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 32, paddingVertical: 8, borderTopWidth: 1, borderTopColor: BORDER },
    footerText: { fontSize: 7, color: GRAY },
    footerPage: { fontSize: 7, color: primary, fontFamily: 'Helvetica-Bold' },

    content: { paddingHorizontal: 32, paddingVertical: 16 },

    sectionTitle: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: primary, marginBottom: 10, paddingBottom: 6, borderBottomWidth: 2, borderBottomColor: secondary },
    sectionSubtitle: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: primary, marginBottom: 6 },

    card: { backgroundColor: WHITE, borderWidth: 1, borderColor: BORDER, borderRadius: 4, padding: 12, marginBottom: 10 },
    cardBlue: { backgroundColor: '#F0F4FF', borderWidth: 1, borderColor: '#C7D4F0', borderRadius: 4, padding: 12, marginBottom: 10 },
    cardGold: { backgroundColor: '#FFFBEB', borderWidth: 1, borderColor: '#FDE68A', borderRadius: 4, padding: 12, marginBottom: 10 },

    label: { fontSize: 7, color: GRAY, marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.5 },
    value: { fontSize: 9, color: '#1e293b', fontFamily: 'Helvetica-Bold' },
    valueNormal: { fontSize: 9, color: '#1e293b' },

    divider: { borderBottomWidth: 1, borderBottomColor: BORDER, marginVertical: 8 },

    table: { borderWidth: 1, borderColor: BORDER, borderRadius: 4, overflow: 'hidden', marginBottom: 10 },
    tableHeader: { flexDirection: 'row', backgroundColor: primary, paddingVertical: 6, paddingHorizontal: 8 },
    tableHeaderCell: { fontSize: 7, color: WHITE, fontFamily: 'Helvetica-Bold', flex: 1 },
    tableRow: { flexDirection: 'row', paddingVertical: 5, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: BORDER },
    tableRowAlt: { backgroundColor: LIGHT_GRAY },
    tableCell: { fontSize: 8, color: '#1e293b', flex: 1 },

    boardingPass: { borderWidth: 1, borderColor: primary, borderRadius: 6, overflow: 'hidden', marginBottom: 10 },
    boardingHeader: { backgroundColor: primary, paddingHorizontal: 14, paddingVertical: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    boardingBody: { flexDirection: 'row', padding: 12, backgroundColor: WHITE },

    routeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: secondary, marginHorizontal: 4 },
    routeLine: { flex: 1, height: 1, backgroundColor: secondary, marginTop: 3 },

    // Cover specific
    coverAccentTop: { height: 6, backgroundColor: secondary },
    coverAccentNavy: { height: 2, backgroundColor: primary },
    coverStatBorder: { borderWidth: 1, borderColor: BORDER, borderRadius: 6, overflow: 'hidden' },
    coverStatValue: { fontSize: 22, color: primary, fontFamily: 'Helvetica-Bold' },
    coverStatLabel: { fontSize: 6, color: '#94a3b8', letterSpacing: 1, marginTop: 4 },
    coverPassengerBar: { borderLeftWidth: 3, borderLeftColor: secondary, paddingLeft: 14 },
  })
}

// Default styles
export const styles = makeStyles(NAVY, GOLD)
