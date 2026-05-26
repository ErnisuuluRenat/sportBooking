import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { useNavigate } from 'react-router-dom'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Venue } from '../types'

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const orangeIcon = L.divIcon({
  className: '',
  html: `<div style="
    background:#F97316;
    border:2px solid #fff;
    border-radius:50% 50% 50% 0;
    transform:rotate(-45deg);
    width:28px;height:28px;
    box-shadow:0 2px 8px rgba(0,0,0,0.3)
  "></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
})

interface Props {
  venues: Venue[]
}

export const VenuesMap = ({ venues }: Props) => {
  const navigate = useNavigate()
  const withCoords = venues.filter(v => v.location?.coordinates?.length === 2)

  const center: [number, number] = withCoords.length > 0
    ? [withCoords[0].location!.coordinates[1], withCoords[0].location!.coordinates[0]]
    : [42.8746, 74.5698]

  return (
    <div className="rounded-card overflow-hidden border border-border-subtle" style={{ height: 480 }}>
      <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }} scrollWheelZoom={true}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {withCoords.map(venue => (
          <Marker
            key={venue._id}
            position={[venue.location!.coordinates[1], venue.location!.coordinates[0]]}
            icon={orangeIcon}
          >
            <Popup>
              <div style={{ minWidth: 160 }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{venue.name}</div>
                <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>{venue.address}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, color: '#F97316' }}>{venue.pricePerHour.toLocaleString()} сом/ч</span>
                  <button
                    onClick={() => navigate(`/venues/${venue._id}`)}
                    style={{ background: '#F97316', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}
                  >
                    Открыть
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}