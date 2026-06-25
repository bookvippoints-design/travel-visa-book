import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://pistikoobutxxzwqhwas.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpc3Rpa29vYnV0eHh6d3Fod2FzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzNDA5NzgsImV4cCI6MjA5NzkxNjk3OH0.fBRu4oYq_dMtcOB726dz5PPBQFX5oWrVxQ-9CVAyfRs'
)

// Sign in as demo company to get session
const { data: session, error: loginErr } = await supabase.auth.signInWithPassword({
  email: 'demo@visasecuador.com',
  password: 'Demo2025!'
})

if (loginErr) { console.error('Login error:', loginErr.message); process.exit(1) }
console.log('✅ Logged in as demo company')

// Get company id
const { data: company } = await supabase
  .from('companies')
  .select('id')
  .eq('email', 'demo@visasecuador.com')
  .single()

const COMPANY_ID = company.id
console.log('Company ID:', COMPANY_ID)

// ─── 1. UPDATE COMPANY PROFILE ───────────────────────────────────────────────
const { error: updateErr } = await supabase.from('companies').update({
  name: 'Demo Visas S.A.S.',
  commercial_name: 'Demo Visas',
  phone: '+593 2 254 7890',
  whatsapp: '+593 98 765 4321',
  website: 'https://www.demovisas.com.ec',
  address: 'Av. Naciones Unidas E10-44 y Shyris, Edificio Renazzo Plaza, Of. 302, Quito, Ecuador',
  logo_url: 'https://pistikoobutxxzwqhwas.supabase.co/storage/v1/object/public/travel-visa-book/demo/logo.png',
  primary_color: '#1A3F7A',
  secondary_color: '#B8860B',
}).eq('id', COMPANY_ID)

if (updateErr) console.error('Company update error:', updateErr.message)
else console.log('✅ Company profile updated')

// ─── 2. UPLOAD LOGO to storage (use public image URL as base) ─────────────────
// Fetch the uploaded logo PNG and store it in Supabase storage
try {
  const logoRes = await fetch('https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Test-Logo.svg/512px-Test-Logo.svg.png')
  // We'll reference the already-uploaded file path after manual upload
  console.log('ℹ️  Logo will be set via SQL update below')
} catch(e) {}

// ─── 3. BUILD FULL DOCUMENT DATA ──────────────────────────────────────────────
const documentData = {
  passengers: [{
    name: 'Carlos Andrés Mendoza Ríos',
    nationality: 'Ecuatoriana',
    birthDate: '1985-03-15',
    passportNumber: 'PEB123456',
    passportExpiry: '2030-03-14',
    passportIssuer: 'Ecuador',
    phone: '+593 98 123 4567',
    email: 'carlos.mendoza@gmail.com',
    address: 'Calle Isla Isabela N34-21 y Portugal, Quito, Ecuador',
    occupation: 'Gerente Comercial',
    employer: 'TechSolutions Ecuador S.A.',
    emergencyContact: 'María Elena Ríos de Mendoza',
    emergencyPhone: '+593 99 876 5432',
    notes: 'Viajero frecuente. Cuenta con visa Schengen previa.'
  }],

  trip: {
    title: 'Europa Clásica — España · Francia · Italia',
    mainCountry: 'España',
    countries: 'España, Francia, Italia',
    cities: 'Madrid, Barcelona, París, Roma, Florencia, Venecia',
    startDate: '2025-08-10',
    endDate: '2025-08-28',
    tripPurpose: 'turismo',
    tripType: 'individual',
    currency: 'EUR',
    language: 'Español',
    expeditionCode: 'EXP-DV-2025-0047',
    emissionDate: '2025-07-01',
    notes: 'Itinerario confirmado en su totalidad. El pasajero ha adquirido todos los servicios con anticipación.'
  },

  itinerary: [
    { day: 1, date: '2025-08-10', city: 'Madrid', country: 'España', title: 'Llegada a Madrid — Bienvenido a España', description: 'Llegada al Aeropuerto Adolfo Suárez Madrid-Barajas. Traslado al hotel en el centro histórico. Tarde libre para ambientarse y descansar del vuelo.', hotel: 'Hotel NH Collection Gran Vía', meals: 'Sin incluir', status: 'confirmado',
      activities: [
        { time: '14:00', name: 'Check-in hotel', place: 'Hotel NH Collection Gran Vía', description: 'Recepción y acomodación en el hotel.', duration: '1 hora', confirmed: true },
        { time: '17:00', name: 'Paseo por Gran Vía', place: 'Gran Vía, Madrid', description: 'Primera caminata por la icónica avenida madrileña.', duration: '2 horas', confirmed: true },
        { time: '20:00', name: 'Cena en Sobrino de Botín', place: 'Calle Cuchilleros 17, Madrid', description: 'Cena en el restaurante más antiguo del mundo, especialidad cochinillo asado.', duration: '2 horas', confirmed: true }
      ]
    },
    { day: 2, date: '2025-08-11', city: 'Madrid', country: 'España', title: 'Madrid Cultural — Prado y Retiro', description: 'Día dedicado a los tesoros culturales de Madrid: el museo más importante de España y el parque más emblemático de la ciudad.', hotel: 'Hotel NH Collection Gran Vía', meals: 'Desayuno incluido', status: 'confirmado',
      activities: [
        { time: '09:00', name: 'Museo del Prado', place: 'Paseo del Prado, Madrid', description: 'Visita guiada a las obras de Velázquez, Goya y El Greco.', duration: '3 horas', confirmed: true },
        { time: '13:00', name: 'Almuerzo en Mercado de San Miguel', place: 'Plaza de San Miguel, Madrid', description: 'Tapas y gastronomía española en el mercado gourmet.', duration: '1.5 horas', confirmed: true },
        { time: '15:30', name: 'Parque del Retiro', place: 'Parque del Retiro, Madrid', description: 'Paseo por el parque, visita al Palacio de Cristal y el lago.', duration: '2 horas', confirmed: true },
        { time: '19:00', name: 'Barrio de La Latina y Tapas', place: 'Barrio La Latina, Madrid', description: 'Recorrido por el barrio más pintoresco de Madrid con parada de tapas.', duration: '2 horas', confirmed: true }
      ]
    },
    { day: 3, date: '2025-08-12', city: 'Madrid', country: 'España', title: 'Palacio Real y Toledo', description: 'Mañana en el Palacio Real y tarde en Toledo, la ciudad imperial, declarada Patrimonio de la Humanidad.', hotel: 'Hotel NH Collection Gran Vía', meals: 'Desayuno incluido', status: 'confirmado',
      activities: [
        { time: '09:30', name: 'Palacio Real de Madrid', place: 'Calle de Bailén, Madrid', description: 'Visita a la residencia oficial de la Familia Real Española.', duration: '2 horas', confirmed: true },
        { time: '13:00', name: 'Excursión a Toledo', place: 'Toledo, España', description: 'Ciudad de las Tres Culturas: cristiana, musulmana y judía.', duration: '5 horas', confirmed: true }
      ]
    },
    { day: 4, date: '2025-08-13', city: 'Barcelona', country: 'España', title: 'Viaje a Barcelona — La Ciudad Condal', description: 'Traslado en tren AVE a Barcelona. Tarde de llegada y primer contacto con la ciudad de Gaudí.', hotel: 'Hotel Arts Barcelona', meals: 'Desayuno incluido', status: 'confirmado',
      activities: [
        { time: '08:00', name: 'Tren AVE Madrid-Barcelona', place: 'Estación Atocha, Madrid', description: 'Viaje en tren de alta velocidad, duración aproximada 2h 30min.', duration: '2.5 horas', confirmed: true },
        { time: '11:00', name: 'Check-in Hotel Arts', place: 'Carrer de la Marina 19-21, Barcelona', description: 'Acomodación en hotel frente al mar.', duration: '1 hora', confirmed: true },
        { time: '14:00', name: 'Las Ramblas y Barrio Gótico', place: 'Las Ramblas, Barcelona', description: 'Paseo por el bulevar más famoso y el casco histórico medieval.', duration: '3 horas', confirmed: true }
      ]
    },
    { day: 5, date: '2025-08-14', city: 'Barcelona', country: 'España', title: 'Gaudí y Modernismo Catalán', description: 'Día completo dedicado a las obras maestras de Antoni Gaudí, el genio del modernismo catalán.', hotel: 'Hotel Arts Barcelona', meals: 'Desayuno incluido', status: 'confirmado',
      activities: [
        { time: '09:00', name: 'Sagrada Família', place: 'Carrer de Mallorca 401, Barcelona', description: 'Visita con reserva prioritaria a la basílica más visitada de España.', duration: '2 horas', confirmed: true },
        { time: '12:00', name: 'Park Güell', place: 'Carrer d\'Olot, Barcelona', description: 'Parque urbano con vistas panorámicas de Barcelona.', duration: '1.5 horas', confirmed: true },
        { time: '15:00', name: 'Casa Batlló', place: 'Passeig de Gràcia 43, Barcelona', description: 'Visita guiada al edificio más emblemático de Gaudí en el Eixample.', duration: '1.5 horas', confirmed: true },
        { time: '19:00', name: 'Barceloneta y Cena Mediterránea', place: 'Playa Barceloneta, Barcelona', description: 'Cena con vista al mar, especialidad paella y mariscos.', duration: '2 horas', confirmed: true }
      ]
    },
    { day: 6, date: '2025-08-15', city: 'París', country: 'Francia', title: 'Vuelo Barcelona-París — La Ciudad Luz', description: 'Vuelo matutino a París. Llegada y primera tarde en la capital francesa, la ciudad más visitada del mundo.', hotel: 'Le Marais Boutique Hotel', meals: 'Desayuno incluido', status: 'confirmado',
      activities: [
        { time: '07:00', name: 'Vuelo a París', place: 'Aeropuerto El Prat, Barcelona', description: 'Vuelo Vueling Barcelona-París CDG.', duration: '2 horas', confirmed: true },
        { time: '11:30', name: 'Check-in Le Marais Boutique Hotel', place: 'Le Marais, París', description: 'Acomodación en el corazón histórico de París.', duration: '1 hora', confirmed: true },
        { time: '14:00', name: 'Torre Eiffel', place: 'Champ de Mars, París', description: 'Visita al símbolo de Francia con reserva anticipada para subir al segundo piso.', duration: '2.5 horas', confirmed: true },
        { time: '18:00', name: 'Crucero por el Sena', place: 'Pont d\'Iéna, París', description: 'Crucero turístico de 1 hora por el río Sena al atardecer.', duration: '1 hora', confirmed: true }
      ]
    },
    { day: 7, date: '2025-08-16', city: 'París', country: 'Francia', title: 'Versalles y Montmartre', description: 'Mañana en el majestuoso Palacio de Versalles y tarde en el bohemio barrio de Montmartre.', hotel: 'Le Marais Boutique Hotel', meals: 'Desayuno incluido', status: 'confirmado',
      activities: [
        { time: '08:30', name: 'Palacio de Versalles', place: 'Versalles, Francia', description: 'Visita al palacio más grandioso de Europa y sus jardines.', duration: '4 horas', confirmed: true },
        { time: '15:00', name: 'Montmartre y Sacré-Cœur', place: 'Montmartre, París', description: 'Barrio bohemio con la basílica del Sagrado Corazón y vista panorámica.', duration: '2.5 horas', confirmed: true },
        { time: '19:30', name: 'Cena en Le Procope', place: 'Rue de l\'Ancienne Comédie 13, París', description: 'Cena en el café más antiguo de París, fundado en 1686.', duration: '2 horas', confirmed: true }
      ]
    },
    { day: 8, date: '2025-08-17', city: 'París', country: 'Francia', title: 'Louvre y Campos Elíseos', description: 'Mañana en el museo más grande del mundo y tarde paseando por la avenida más famosa de Francia.', hotel: 'Le Marais Boutique Hotel', meals: 'Desayuno incluido', status: 'confirmado',
      activities: [
        { time: '09:00', name: 'Museo del Louvre', place: 'Rue de Rivoli, París', description: 'Visita a La Gioconda, La Venus de Milo y La Victoria de Samotracia.', duration: '3 horas', confirmed: true },
        { time: '13:30', name: 'Jardín de las Tullerías', place: 'Jardin des Tuileries, París', description: 'Paseo por los jardines más elegantes de París.', duration: '1 hora', confirmed: true },
        { time: '15:00', name: 'Campos Elíseos y Arco del Triunfo', place: 'Champs-Élysées, París', description: 'Paseo por la avenida más famosa del mundo hasta el Arco del Triunfo.', duration: '2.5 horas', confirmed: true }
      ]
    },
    { day: 9, date: '2025-08-18', city: 'Roma', country: 'Italia', title: 'Vuelo París-Roma — La Ciudad Eterna', description: 'Vuelo a Roma y llegada a la capital italiana. Primera tarde explorando el centro histórico.', hotel: 'Hotel de Russie Roma', meals: 'Desayuno incluido', status: 'confirmado',
      activities: [
        { time: '08:00', name: 'Vuelo París-Roma', place: 'Aeropuerto Charles de Gaulle, París', description: 'Vuelo Air France París CDG - Roma Fiumicino.', duration: '2.5 horas', confirmed: true },
        { time: '12:30', name: 'Check-in Hotel de Russie', place: 'Via del Babuino 9, Roma', description: 'Hotel 5 estrellas en el corazón de Roma.', duration: '1 hora', confirmed: true },
        { time: '15:00', name: 'Fontana di Trevi y Plaza Navona', place: 'Centro Histórico, Roma', description: 'Visita a los iconos más fotografiados de Roma.', duration: '3 horas', confirmed: true }
      ]
    },
    { day: 10, date: '2025-08-19', city: 'Roma', country: 'Italia', title: 'Vaticano y Coliseo', description: 'Día completo en los dos sitios más visitados del mundo: el Estado Vaticano y el Coliseo Romano.', hotel: 'Hotel de Russie Roma', meals: 'Desayuno incluido', status: 'confirmado',
      activities: [
        { time: '08:00', name: 'Museos Vaticanos y Capilla Sixtina', place: 'Città del Vaticano', description: 'Visita guiada con acceso prioritario a los frescos de Miguel Ángel.', duration: '3 horas', confirmed: true },
        { time: '11:30', name: 'Basílica de San Pedro', place: 'Plaza San Pedro, Vaticano', description: 'Visita a la basílica más grande del mundo.', duration: '1.5 horas', confirmed: true },
        { time: '14:30', name: 'Coliseo Romano', place: 'Piazza del Colosseo, Roma', description: 'Visita al anfiteatro más famoso del mundo, icono del Imperio Romano.', duration: '2 horas', confirmed: true },
        { time: '17:00', name: 'Foro Romano', place: 'Via Sacra, Roma', description: 'Recorrido por las ruinas del corazón de la Roma antigua.', duration: '1.5 horas', confirmed: true }
      ]
    },
    { day: 11, date: '2025-08-20', city: 'Florencia', country: 'Italia', title: 'Tren a Florencia — Cuna del Renacimiento', description: 'Viaje en tren a Florencia, la ciudad que vio nacer el Renacimiento italiano.', hotel: 'Hotel Lungarno Firenze', meals: 'Desayuno incluido', status: 'confirmado',
      activities: [
        { time: '08:30', name: 'Tren Roma-Florencia', place: 'Estación Termini, Roma', description: 'Tren Frecciarossa, duración 1h 30min.', duration: '1.5 horas', confirmed: true },
        { time: '11:00', name: 'Galería Uffizi', place: 'Piazzale degli Uffizi, Florencia', description: 'La colección de arte renacentista más importante del mundo: Botticelli, Leonardo, Rafael.', duration: '2.5 horas', confirmed: true },
        { time: '15:00', name: 'Catedral de Santa María del Fiore', place: 'Piazza del Duomo, Florencia', description: 'La cúpula de Brunelleschi, obra maestra de la arquitectura renacentista.', duration: '1.5 horas', confirmed: true },
        { time: '18:00', name: 'Ponte Vecchio al atardecer', place: 'Ponte Vecchio, Florencia', description: 'El puente más antiguo de Florencia, ideal para fotografías al atardecer.', duration: '1 hora', confirmed: true }
      ]
    },
    { day: 12, date: '2025-08-21', city: 'Venecia', country: 'Italia', title: 'Venecia — La Serenísima República', description: 'Día completo en Venecia, la ciudad más romántica y única del mundo, construida sobre el agua.', hotel: 'Hotel Danieli Venezia', meals: 'Desayuno incluido', status: 'confirmado',
      activities: [
        { time: '07:30', name: 'Tren Florencia-Venecia', place: 'Estación Santa Maria Novella, Florencia', description: 'Tren Freccia, duración 2 horas.', duration: '2 horas', confirmed: true },
        { time: '10:30', name: 'Plaza San Marcos', place: 'Piazza San Marco, Venecia', description: 'La sala de estar de Europa: Basílica de San Marcos y Torre del Reloj.', duration: '2 horas', confirmed: true },
        { time: '14:00', name: 'Paseo en góndola', place: 'Canal Grande, Venecia', description: 'Recorrido tradicional en góndola por los canales históricos de Venecia.', duration: '1 hora', confirmed: true },
        { time: '16:00', name: 'Isla de Murano', place: 'Murano, Venecia', description: 'Visita a la isla famosa por el cristal de Murano y demostración en directo.', duration: '2 horas', confirmed: true }
      ]
    },
    { day: 13, date: '2025-08-22', city: 'Venecia', country: 'Italia', title: 'Día libre en Venecia', description: 'Día libre para explorar los rincones menos turísticos de Venecia o realizar compras de recuerdos.', hotel: 'Hotel Danieli Venezia', meals: 'Desayuno incluido', status: 'confirmado', activities: [] },
    { day: 14, date: '2025-08-23', city: 'Quito', country: 'Ecuador', title: 'Regreso a Quito', description: 'Vuelo de regreso desde Venecia vía Roma o Milán hacia Quito, Ecuador. Fin de un viaje inolvidable.', hotel: '', meals: 'A bordo', status: 'confirmado',
      activities: [
        { time: '10:00', name: 'Check-out y traslado al aeropuerto', place: 'Hotel Danieli, Venecia', description: 'Traslado en lancha taxi al aeropuerto Marco Polo.', duration: '45 min', confirmed: true },
        { time: '13:30', name: 'Vuelo Venecia-Madrid-Quito', place: 'Aeropuerto Marco Polo, Venecia', description: 'Vuelo de conexión Iberia: VCE-MAD-UIO.', duration: '16 horas', confirmed: true }
      ]
    }
  ],

  hotels: [
    { name: 'NH Collection Gran Vía', type: 'hotel', stars: '4', city: 'Madrid', country: 'España', address: 'Gran Vía 21, 28013 Madrid, España', checkin: '2025-08-10', checkout: '2025-08-13', roomType: 'Superior Doble', regime: 'desayuno incluido', reservationCode: 'NH-2025-MDR-4471', status: 'confirmado', notes: 'Solicitar habitación alta para vista Gran Vía.' },
    { name: 'Hotel Arts Barcelona', type: 'hotel', stars: '5', city: 'Barcelona', country: 'España', address: 'Carrer de la Marina 19-21, 08005 Barcelona, España', checkin: '2025-08-13', checkout: '2025-08-15', roomType: 'Deluxe Mar', regime: 'desayuno incluido', reservationCode: 'ARTS-2025-BCN-8821', status: 'confirmado', notes: 'Vista al mar Mediterráneo garantizada.' },
    { name: 'Le Marais Boutique Hotel', type: 'hotel', stars: '4', city: 'París', country: 'Francia', address: 'Rue des Archives 18, 75004 París, Francia', checkin: '2025-08-15', checkout: '2025-08-18', roomType: 'Clásica Superior', regime: 'desayuno incluido', reservationCode: 'LMB-2025-PAR-3390', status: 'confirmado', notes: 'Ubicado en el corazón histórico de París.' },
    { name: 'Hotel de Russie Roma', type: 'hotel', stars: '5', city: 'Roma', country: 'Italia', address: 'Via del Babuino 9, 00187 Roma, Italia', checkin: '2025-08-18', checkout: '2025-08-20', roomType: 'Deluxe Garden View', regime: 'desayuno incluido', reservationCode: 'DR-2025-ROM-7714', status: 'confirmado', notes: 'A 5 minutos de la Plaza del Popolo.' },
    { name: 'Hotel Lungarno Firenze', type: 'hotel', stars: '4', city: 'Florencia', country: 'Italia', address: 'Borgo San Jacopo 14, 50125 Florencia, Italia', checkin: '2025-08-20', checkout: '2025-08-21', roomType: 'Arno View Room', regime: 'desayuno incluido', reservationCode: 'LNG-2025-FIR-2205', status: 'confirmado', notes: 'Vista al Río Arno y Ponte Vecchio.' },
    { name: 'Hotel Danieli Venezia', type: 'hotel', stars: '5', city: 'Venecia', country: 'Italia', address: 'Riva degli Schiavoni 4196, 30122 Venecia, Italia', checkin: '2025-08-21', checkout: '2025-08-23', roomType: 'Superior Lagoon View', regime: 'desayuno incluido', reservationCode: 'DAN-2025-VEN-9930', status: 'confirmado', notes: 'Hotel histórico frente a la laguna veneciana.' }
  ],

  flights: [
    { type: 'ida', airline: 'Iberia', flightNumber: 'IB 6845', reservationCode: 'IBERIA-UIDMKX', origin: 'Quito', originAirport: 'Aeropuerto Internacional Mariscal Sucre (UIO)', destination: 'Madrid', destinationAirport: 'Aeropuerto Adolfo Suárez Madrid-Barajas (MAD)', departureDate: '2025-08-09', departureTime: '23:55', arrivalDate: '2025-08-10', arrivalTime: '17:10', class: 'económica', luggage: '23kg + 10kg cabina', status: 'confirmado', notes: 'Escala en Bogotá (BOG). Duración total: 14h 15min.' },
    { type: 'conexión', airline: 'Renfe AVE', flightNumber: 'AVE 3012', reservationCode: 'RENFE-BCN-4492', origin: 'Madrid', originAirport: 'Estación Atocha', destination: 'Barcelona', destinationAirport: 'Estación Sants', departureDate: '2025-08-13', departureTime: '09:00', arrivalDate: '2025-08-13', arrivalTime: '11:30', class: 'business', luggage: 'Sin límite', status: 'confirmado', notes: 'Tren de alta velocidad AVE. Asiento 4A ventana.' },
    { type: 'conexión', airline: 'Vueling', flightNumber: 'VY 1234', reservationCode: 'VY-PARIS-7721', origin: 'Barcelona', originAirport: 'Aeropuerto El Prat (BCN)', destination: 'París', destinationAirport: 'Aeropuerto Charles de Gaulle (CDG)', departureDate: '2025-08-15', departureTime: '08:15', arrivalDate: '2025-08-15', arrivalTime: '10:30', class: 'económica', luggage: '23kg incluido', status: 'confirmado', notes: '' },
    { type: 'conexión', airline: 'Air France', flightNumber: 'AF 1230', reservationCode: 'AF-ROMA-3308', origin: 'París', originAirport: 'Aeropuerto Charles de Gaulle (CDG)', destination: 'Roma', destinationAirport: 'Aeropuerto Leonardo da Vinci - Fiumicino (FCO)', departureDate: '2025-08-18', departureTime: '08:40', arrivalDate: '2025-08-18', arrivalTime: '10:55', class: 'económica', luggage: '23kg incluido', status: 'confirmado', notes: '' },
    { type: 'regreso', airline: 'Iberia', flightNumber: 'IB 3183 / IB 6844', reservationCode: 'IBERIA-RETIDMKX', origin: 'Venecia', originAirport: 'Aeropuerto Marco Polo (VCE)', destination: 'Quito', destinationAirport: 'Aeropuerto Internacional Mariscal Sucre (UIO)', departureDate: '2025-08-23', departureTime: '13:30', arrivalDate: '2025-08-24', arrivalTime: '05:15', class: 'económica', luggage: '23kg + 10kg cabina', status: 'confirmado', notes: 'Conexión en Madrid MAD. Llegada a Quito el día 24.' }
  ],

  insurance: {
    company: 'Assist Card Internacional',
    policyNumber: 'AC-EC-2025-447821',
    startDate: '2025-08-09',
    endDate: '2025-08-24',
    medicalCoverage: 'USD 150,000',
    schengenCoverage: 'EUR 30,000 (cumple requisito mínimo Schengen)',
    countries: 'España, Francia, Italia, zona Schengen completa',
    assistanceContact: 'Assist Card 24/7',
    emergencyPhone: '+1-305-381-9959 (internacional)',
    notes: 'Cobertura COVID-19 incluida. Repatriación sanitaria incluida.'
  },

  declaration: {
    responsibleName: 'Lic. Patricia Morales',
    customText: 'El presente documento ha sido elaborado por Demo Visas con fines informativos y de planificación turística, como respaldo del itinerario propuesto para el pasajero. La información contenida en este documento corresponde a los datos proporcionados por el cliente y/o a las reservas, servicios y actividades planificadas al momento de su emisión. Las actividades, horarios, alojamientos, transportes y servicios pueden estar sujetos a modificaciones por razones operativas, disponibilidad, cambios de proveedor, clima, fuerza mayor o disposiciones migratorias.\n\nEste documento no constituye garantía de aprobación de visa ni garantía de ingreso a ningún país. La decisión final corresponde exclusivamente a las autoridades consulares y migratorias competentes.'
  },

  tips: {
    currency: 'Euro (EUR). 1 USD ≈ 0.92 EUR al momento de emisión.',
    language: 'Español (España), Francés (Francia), Italiano (Italia)',
    climate: 'Agosto: verano europeo. Temperaturas entre 25°C-38°C. Llevar ropa ligera, protector solar y calzado cómodo para caminar.',
    plug: 'Tipo C y F (europeo). Voltaje 220V. Llevar adaptador universal.',
    emergencyNumbers: 'Emergencias Europa: 112 | Policía España: 091 | SAMU Francia: 15 | Policía Italia: 113',
    migrationTips: 'Pasaporte con vigencia mínima 6 meses. Requiere visa Schengen vigente. No se requiere registro adicional entre países Schengen.',
    luggageTips: 'Maleta de 23kg + equipaje de mano 10kg. Se recomienda maleta con ruedas para facilitar traslados entre ciudades.',
    securityTips: 'Mantener documentos en lugar seguro. Evitar zonas turísticas muy concurridas para cuidar pertenencias. Usar bolso cruzado.',
    culturalTips: 'En Francia es habitual saludar con beso en mejilla. En Italia las propinas no son obligatorias. Respetar códigos de vestimenta en iglesias y catedrales (hombros y rodillas cubiertos).'
  }
}

// ─── 4. INSERT TRAVEL DOCUMENT ────────────────────────────────────────────────
const { data: doc, error: docErr } = await supabase.from('travel_documents').insert([{
  company_id: COMPANY_ID,
  passenger_name: 'Carlos Andrés Mendoza Ríos',
  passport_number: 'PEB123456',
  destination_title: 'Europa Clásica — España · Francia · Italia',
  countries: ['España', 'Francia', 'Italia'],
  start_date: '2025-08-10',
  end_date: '2025-08-23',
  expedition_code: 'EXP-DV-2025-0047',
  status: 'finalized',
  document_data: documentData
}]).select().single()

if (docErr) {
  console.error('Document error:', docErr.message)
} else {
  console.log('✅ Travel document created:', doc.id)

  // Update counter
  await supabase.rpc('increment_document_counter', { p_company_id: COMPANY_ID })
  console.log('✅ Counter updated')
}

console.log('\n🎉 Demo data complete!')
console.log('Company:', COMPANY_ID)
console.log('Document ID:', doc?.id)
