"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

// Fix default Leaflet marker icon issue
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface ListingMapProps {
  latitude: number;
  longitude: number;
  title: string;
}

export default function ListingMap({
  latitude,
  longitude,
  title,
}: ListingMapProps) {
  const gmapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
  const osmUrl = `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=16/${latitude}/${longitude}`;

  return (
    <div className="space-y-2">
      <div className="rounded-xl overflow-hidden h-[300px] w-full border border-gray-200">
        <MapContainer
          center={[latitude, longitude]}
          zoom={15}
          scrollWheelZoom={true}
          dragging={true}
          zoomControl={true}
          doubleClickZoom={true}
          touchZoom={true}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[latitude, longitude]}>
            <Popup>{title}</Popup>
          </Marker>
        </MapContainer>
      </div>
      <div className="flex gap-2 text-xs">
        <a
          href={gmapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 text-center py-1.5 px-3 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition"
        >
          Open in Google Maps
        </a>
        <a
          href={osmUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 text-center py-1.5 px-3 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition"
        >
          Open in OpenStreetMap
        </a>
      </div>
    </div>
  );
}
