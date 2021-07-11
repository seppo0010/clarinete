import health from './images/health.svg'
import lifestyle from './images/lifestyle.svg'
import money from './images/money.svg'
import opinion from './images/opinion.svg'
import police from './images/police.svg'
import politics from './images/politics.svg'
import popcorn from './images/popcorn.svg'
import science from './images/science.svg'
import society from './images/society.svg'
import sports from './images/sports.svg'
import court from './images/court.svg'
import energy from './images/energy.svg'
import question from './images/question.svg'
import technology from './images/technology.svg'
import world from './images/world.svg'



export const filter = [
  'qué pasa',
  'noticias',
  'domingo',
  'sábado show',
  'secciones-especiales',
]

export const map: {[f: string]: string} = {
  'columnistas': 'opinión',
  'opiniones': 'opinión',
  'editorial': 'opinión',
  'politica': 'política',
  'negocios': 'finanzas',
  'economia': 'finanzas',
  'economía': 'finanzas',
  'el empresario': 'finanzas',
  'internacionales': 'internacional',
  'mundo': 'internacional',
  'tecnologia': 'tecnología',
  'informacion-general': 'sociedad',
  'fútbol': 'deportes',
  'vida actual': 'sociedad',
  'cultural': 'sociedad',
  'buena vida': 'salud',
  'vida-sana-nutricion': 'salud',
  'astros': 'ciencia',
  'moda': 'lifestyle',
  'viajes': 'lifestyle',
  'series': 'entretenimiento',
  'música': 'entretenimiento',
  'cine': 'entretenimiento',
  'espectaculos': 'entretenimiento',
  'ciudades': 'sociedad',
  'libros': 'sociedad',
  'personajes': 'entretenimiento',
  'rurales': 'finanzas',
  'rural': 'finanzas',
  'servicios': 'finanzas',
  'energia': 'energía',
}

export const images: {[f: string]: string} = {
  ciencia: science,
  deportes: sports,
  salud: health,
  lifestyle: lifestyle,
  finanzas: money,
  opinión: opinion,
  policiales: police,
  política: politics,
  entretenimiento: popcorn,
  sociedad: society,
  judiciales: court,
  energía: energy,
  otros: question,
  tecnología: technology,
  internacional: world,
}
