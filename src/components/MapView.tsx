"use client";

import { useEffect } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

// Fix default Leaflet marker icon issue
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface MapListing {
  id: string;
  title: string;
  price: number | null;
  latitude: number;
  longitude: number;
  image?: string;
}

interface MapViewProps {
  listings: MapListing[];
  center?: [number, number];
  zoom?: number;
}

export default function MapView({
  listings,
  center = [-15.3875, 28.3228],
  zoom = 12,
}: MapViewProps) {
  return (
    <div className="rounded-xl overflow-hidden h-[500px] w-full">
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {listings.map((listing) => (
          <Marker
            key={listing.id}
            position={[listing.latitude, listing.longitude]}
          >
            <Popup>
              <div className="min-w-[160px]">
                {listing.image && (
                  <img
                    src={listing.image}
                    alt={listing.title}
                    className="w-full h-24 object-cover rounded mb-2"
                  />
                )}
                <p className="font-semibold text-sm text-gray-900 mb-1">
                  {listing.title}
                </p>
                <p className="text-sm font-bold text-blue-600 mb-2">
                  {formatPrice(listing.price)}
                </p>
                <Link
                  href={`/listings/${listing.id}`}
                  className="text-xs text-blue-600 hover:underline"
                >
                  View listing
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
