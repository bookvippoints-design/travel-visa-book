import { StyleSheet, Font } from '@react-pdf/renderer'

export const NAVY = '#1A3F7A'
export const GOLD = '#B8860B'
export const LIGHT_BLUE = '#EFF6FF'
export const GRAY = '#64748b'
export const LIGHT_GRAY = '#F8FAFC'
export const BORDER = '#E2E8F0'
export const GREEN = '#10b981'
export const WHITE = '#FFFFFF'

export const styles = StyleSheet.create({
  page: { fontFamily: 'Helvetica', fontSize: 9, color: '#1e293b', backgroundColor: WHITE },

  // Layout
  section: { marginBottom: 16 },
  row: { flexDirection: 'row' },
  col2: { flex: 1 },

  // Header
  pageHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 32, paddingVertical: 10, backgroundColor: NAVY, marginBottom: 0 },
  headerLogo: { width: 60, height: 24, objectFit: 'contain' },
  headerTitle: { fontSize: 8, color: '#93c5fd', letterSpacing: 1 },
  headerRight: { fontSize: 7, color: '#93c5fd', textAlign: 'right' },

  // Footer
  pageFooter: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 32, paddingVertical: 8, borderTopWidth: 1, borderTopColor: BORDER },
  footerText: { fontSize: 7, color: GRAY },
  footerPage: { fontSize: 7, color: NAVY, fontFamily: 'Helvetica-Bold' },

  // Content area
  content: { paddingHorizontal: 32, paddingVertical: 16 },

  // Section titles
  sectionTitle: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: NAVY, marginBottom: 10, paddingBottom: 6, borderBottomWidth: 2, borderBottomColor: GOLD },
  sectionSubtitle: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: NAVY, marginBottom: 6 },

  // Cards
  card: { backgroundColor: WHITE, borderWidth: 1, borderColor: BORDER, borderRadius: 4, padding: 12, marginBottom: 10 },
  cardBlue: { backgroundColor: LIGHT_BLUE, borderWidth: 1, borderColor: '#BFDBFE', borderRadius: 4, padding: 12, marginBottom: 10 },
  cardGold: { backgroundColor: '#FFFBEB', borderWidth: 1, borderColor: '#FDE68A', borderRadius: 4, padding: 12, marginBottom: 10 },

  // Labels and values
  label: { fontSize: 7, color: GRAY, marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.5 },
  value: { fontSize: 9, color: '#1e293b', fontFamily: 'Helvetica-Bold' },
  valueNormal: { fontSize: 9, color: '#1e293b' },

  // Badges
  badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10, fontSize: 7 },
  badgeGreen: { backgroundColor: '#D1FAE5', color: '#065F46' },
  badgeBlue: { backgroundColor: LIGHT_BLUE, color: NAVY },
  badgeGold: { backgroundColor: '#FEF3C7', color: '#92400E' },

  // Divider
  divider: { borderBottomWidth: 1, borderBottomColor: BORDER, marginVertical: 8 },

  // Table
  table: { borderWidth: 1, borderColor: BORDER, borderRadius: 4, overflow: 'hidden', marginBottom: 10 },
  tableHeader: { flexDirection: 'row', backgroundColor: NAVY, paddingVertical: 6, paddingHorizontal: 8 },
  tableHeaderCell: { fontSize: 7, color: WHITE, fontFamily: 'Helvetica-Bold', flex: 1 },
  tableRow: { flexDirection: 'row', paddingVertical: 5, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: BORDER },
  tableRowAlt: { backgroundColor: LIGHT_GRAY },
  tableCell: { fontSize: 8, color: '#1e293b', flex: 1 },

  // Day card
  dayNumber: { width: 28, height: 28, backgroundColor: NAVY, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  dayNumberText: { fontSize: 10, color: WHITE, fontFamily: 'Helvetica-Bold' },

  // Boarding pass style
  boardingPass: { borderWidth: 1, borderColor: NAVY, borderRadius: 6, overflow: 'hidden', marginBottom: 10 },
  boardingHeader: { backgroundColor: NAVY, paddingHorizontal: 14, paddingVertical: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  boardingBody: { flexDirection: 'row', padding: 12, backgroundColor: WHITE },
  boardingDivider: { width: 1, backgroundColor: BORDER, marginHorizontal: 12 },

  // Route line
  routeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: GOLD, marginHorizontal: 4 },
  routeLine: { flex: 1, height: 1, backgroundColor: GOLD, marginTop: 3 },
})
