'use client';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { StudySpot } from '../../lib/types';

// Fix leaflet's broken default icon paths in webpack/Next.js
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface Props {
  spots: StudySpot[];
}

export default function SpotMap({ spots }: Props) {
  const center = spots.length
    ? [spots[0].latitude!, spots[0].longitude!] as [number, number]
    : [43.65107, -79.347015] as [number, number];

  return (
    <MapContainer
      center={center}
      zoom={15}
      style={{ height: '420px', borderRadius: '0.5rem', border: '1px solid var(--color-surface-border)' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {spots.map(spot => (
        <Marker key={spot.id} position={[spot.latitude!, spot.longitude!]} icon={icon}>
          <Popup>
            <div style={{ minWidth: '140px' }}>
              <p style={{ fontWeight: 600, marginBottom: '2px' }}>{spot.name}</p>
              <p style={{ fontSize: '12px', color: '#888' }}>{spot.location}</p>
              <p style={{ fontSize: '12px', marginTop: '4px' }}>★ {spot.rating.toFixed(1)} · {spot.capacity} seats</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
