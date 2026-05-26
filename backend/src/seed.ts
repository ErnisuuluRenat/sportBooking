import mongoose from 'mongoose'
import * as bcrypt from 'bcryptjs'
import * as dotenv from 'dotenv'

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI as string

const userSchema = new mongoose.Schema({ name: String, email: String, password: String, role: String })
const venueSchema = new mongoose.Schema({
  name: String, description: String, sportType: String,
  address: String, city: String, pricePerHour: Number,
  images: [String], amenities: [String], owner: mongoose.Types.ObjectId,
  rating: Number, reviewsCount: Number, isActive: Boolean,
  location: { type: { type: String }, coordinates: [Number] },
})

const User = mongoose.model('User', userSchema)
const Venue = mongoose.model('Venue', venueSchema)

const venues = [
  { name: 'Стадион Динамо', description: 'Профессиональное футбольное поле с искусственным газоном. Современное освещение, трибуны на 200 мест.', sportType: 'football', address: 'ул. Московская 123', city: 'Бишкек', pricePerHour: 1500, amenities: ['Душ', 'Раздевалка', 'Парковка', 'Освещение'], rating: 4.9, reviewsCount: 84, location: { type: 'Point', coordinates: [74.5698, 42.8746] } },
  { name: 'Корт Олимп', description: 'Профессиональный теннисный корт с покрытием хард. Прокат ракеток и мячей.', sportType: 'tennis', address: 'ул. Чуйская 45', city: 'Бишкек', pricePerHour: 800, amenities: ['Душ', 'Раздевалка', 'Прокат инвентаря'], rating: 4.7, reviewsCount: 52, location: { type: 'Point', coordinates: [74.5900, 42.8700] } },
  { name: 'Арена Спорт', description: 'Крытый баскетбольный зал с паркетным покрытием. Возможна аренда на команду.', sportType: 'basketball', address: 'ул. Советская 78', city: 'Бишкек', pricePerHour: 1200, amenities: ['Душ', 'Раздевалка', 'Кондиционер'], rating: 4.8, reviewsCount: 37, location: { type: 'Point', coordinates: [74.5500, 42.8800] } },
  { name: 'Бассейн Нептун', description: 'Олимпийский 50-метровый бассейн. Дорожки для профессионального плавания.', sportType: 'swimming', address: 'ул. Ибраимова 12', city: 'Бишкек', pricePerHour: 600, amenities: ['Душ', 'Раздевалка', 'Сауна', 'Инструктор'], rating: 4.6, reviewsCount: 91, location: { type: 'Point', coordinates: [74.5750, 42.8650] } },
  { name: 'Фитнес Про', description: 'Современный тренажёрный зал с новейшим оборудованием. Персональные тренеры.', sportType: 'gym', address: 'пр. Манаса 56', city: 'Бишкек', pricePerHour: 500, amenities: ['Душ', 'Раздевалка', 'Сауна', 'Персональный тренер', 'Парковка'], rating: 4.5, reviewsCount: 128, location: { type: 'Point', coordinates: [74.5600, 42.8750] } },
  { name: 'Волейбол Центр', description: 'Два волейбольных корта с профессиональным покрытием. Сетки и мячи включены.', sportType: 'volleyball', address: 'ул. Токомбаева 34', city: 'Бишкек', pricePerHour: 700, amenities: ['Душ', 'Раздевалка', 'Инвентарь'], rating: 4.4, reviewsCount: 29, location: { type: 'Point', coordinates: [74.5450, 42.8820] } },
  { name: 'Поле Спартак', description: 'Открытое футбольное поле с натуральным газоном. Идеально для любительских игр.', sportType: 'football', address: 'ул. Жибек Жолу 89', city: 'Бишкек', pricePerHour: 1000, amenities: ['Раздевалка', 'Парковка'], rating: 4.3, reviewsCount: 45, location: { type: 'Point', coordinates: [74.5800, 42.8680] } },
  { name: 'Теннис Клуб Ала-Тоо', description: 'Четыре корта под открытым небом. Тренировки для детей и взрослых.', sportType: 'tennis', address: 'ул. Ала-Тоо 23', city: 'Бишкек', pricePerHour: 900, amenities: ['Душ', 'Кафе', 'Прокат инвентаря', 'Тренер'], rating: 4.8, reviewsCount: 63, location: { type: 'Point', coordinates: [74.5550, 42.8900] } },
  { name: 'СпортХолл Манас', description: 'Многофункциональный спортивный зал. Подходит для баскетбола и волейбола.', sportType: 'basketball', address: 'пр. Чингиза Айтматова 11', city: 'Бишкек', pricePerHour: 1100, amenities: ['Душ', 'Раздевалка', 'Трибуны', 'Парковка'], rating: 4.6, reviewsCount: 41, location: { type: 'Point', coordinates: [74.5350, 42.8760] } },
  { name: 'Аква Бишкек', description: 'Современный аквакомплекс с тремя бассейнами. Детская зона, джакузи, сауна.', sportType: 'swimming', address: 'ул. Байтик Баатыра 67', city: 'Бишкек', pricePerHour: 800, amenities: ['Душ', 'Джакузи', 'Сауна', 'Детская зона', 'Кафе'], rating: 4.9, reviewsCount: 156, location: { type: 'Point', coordinates: [74.5650, 42.8580] } },
  { name: 'Gym Force', description: 'Силовой тренажёрный зал. Кардио зона, зал для единоборств.', sportType: 'gym', address: 'ул. Фрунзе 145', city: 'Бишкек', pricePerHour: 400, amenities: ['Душ', 'Раздевалка', 'Кардио зона', 'Единоборства'], rating: 4.3, reviewsCount: 77, location: { type: 'Point', coordinates: [74.5720, 42.8810] } },
  { name: 'Мини-футбол Победа', description: 'Крытое мини-футбольное поле. Искусственное покрытие, профессиональное освещение.', sportType: 'football', address: 'ул. Победы 34', city: 'Бишкек', pricePerHour: 1300, amenities: ['Душ', 'Раздевалка', 'Трибуны', 'Кафе', 'Парковка'], rating: 4.7, reviewsCount: 58, location: { type: 'Point', coordinates: [74.5480, 42.8640] } },
]

async function seed() {
  await mongoose.connect(MONGODB_URI)
  console.log('Connected to MongoDB')

  const existingVenues = await Venue.countDocuments()
  if (existingVenues > 2) {
    console.log('Venues already seeded, skipping')
    await mongoose.disconnect()
    return
  }

  let owner = await User.findOne({ email: 'owner@sportbook.kg' })
  if (!owner) {
    const hashed = await bcrypt.hash('owner123', 10)
    owner = await User.create({ name: 'Владелец', email: 'owner@sportbook.kg', password: hashed, role: 'owner' })
    console.log('Owner created: owner@sportbook.kg / owner123')
  }

  for (const v of venues) {
    await Venue.create({ ...v, owner: owner._id, isActive: true, images: [] })
    console.log(`Created: ${v.name}`)
  }

  console.log('Seed complete!')
  await mongoose.disconnect()
}

seed().catch(console.error)