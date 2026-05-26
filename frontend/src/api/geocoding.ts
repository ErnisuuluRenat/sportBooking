export const geocodeAddress = async (address: string, city: string): Promise<[number, number] | null> => {
  const query = encodeURIComponent(`${address}, ${city}, Кыргызстан`)
  const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`)
  const data = await res.json()
  if (data.length === 0) return null
  return [parseFloat(data[0].lon), parseFloat(data[0].lat)]
}