"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import { Search, Loader2 } from "lucide-react";

// Fix default Leaflet marker icon issue
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface LocationPickerProps {
  latitude?: number;
  longitude?: number;
  locationText?: string;
  onChange: (lat: number, lng: number) => void;
  onLocationTextChange?: (text: string) => void;
}

function ClickHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function FlyTo({ lat, lng, zoom }: { lat: number; lng: number; zoom: number }) {
  const map = useMap();
  const prevRef = useRef({ lat: 0, lng: 0, zoom: 0 });

  useEffect(() => {
    if (
      lat !== prevRef.current.lat ||
      lng !== prevRef.current.lng ||
      zoom !== prevRef.current.zoom
    ) {
      prevRef.current = { lat, lng, zoom };
      map.flyTo([lat, lng], zoom, { duration: 1.5 });
    }
  }, [map, lat, lng, zoom]);

  return null;
}

export default function LocationPicker({
  latitude,
  longitude,
  locationText,
  onChange,
  onLocationTextChange,
}: LocationPickerProps) {
  const defaultCenter: [number, number] = [-15.3875, 28.3228]; // Lusaka

  const [position, setPosition] = useState<[number, number] | null>(
    latitude != null && longitude != null ? [latitude, longitude] : null
  );
  const [flyLat, setFlyLat] = useState(latitude ?? defaultCenter[0]);
  const [flyLng, setFlyLng] = useState(longitude ?? defaultCenter[1]);
  const [flyZoom, setFlyZoom] = useState(13);

  const [searchQuery, setSearchQuery] = useState(locationText || "");
  const [searching, setSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<
    { display_name: string; lat: string; lon: string }[]
  >([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const geocodeSearch = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query + ", Zambia"
        )}&limit=5&countrycodes=zm`,
        { headers: { "User-Agent": "Zambia.net Market/1.0" } }
      );
      const data = await res.json();
      setSuggestions(data);
      setShowSuggestions(data.length > 0);
    } catch {
      setSuggestions([]);
    } finally {
      setSearching(false);
    }
  }, []);

  function handleInputChange(value: string) {
    setSearchQuery(value);
    if (onLocationTextChange) onLocationTextChange(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => geocodeSearch(value), 400);
  }

  function selectSuggestion(suggestion: {
    display_name: string;
    lat: string;
    lon: string;
  }) {
    const lat = parseFloat(suggestion.lat);
    const lng = parseFloat(suggestion.lon);

    setPosition([lat, lng]);
    setFlyLat(lat);
    setFlyLng(lng);
    setFlyZoom(14);
    onChange(lat, lng);

    const shortName = suggestion.display_name
      .split(",")
      .slice(0, 2)
      .map((s) => s.trim())
      .join(", ");
    setSearchQuery(shortName);
    if (onLocationTextChange) onLocationTextChange(shortName);
    setShowSuggestions(false);
  }

  function handleMapClick(lat: number, lng: number) {
    setPosition([lat, lng]);
    onChange(lat, lng);

    fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
      { headers: { "User-Agent": "Zambia.net Market/1.0" } }
    )
      .then((r) => r.json())
      .then((data) => {
        if (data.display_name) {
          const shortName = data.display_name
            .split(",")
            .slice(0, 2)
            .map((s: string) => s.trim())
            .join(", ");
          setSearchQuery(shortName);
          if (onLocationTextChange) onLocationTextChange(shortName);
        }
      })
      .catch(() => {});
  }

  return (
    <div className="space-y-2">
      {/* Location search */}
      <div className="relative" ref={wrapperRef}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            placeholder="Search location (e.g. Lusaka, Kitwe, Ndola...)"
            className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          {searching && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
          )}
        </div>

        {showSuggestions && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
            {suggestions.map((s, i) => (
              <button
                key={i}
                type="button"
                onClick={() => selectSuggestion(s)}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 border-b border-gray-50 last:border-0"
              >
                {s.display_name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Map */}
      <div className="rounded-xl overflow-hidden h-[300px] w-full border border-gray-200">
        <MapContainer
          center={defaultCenter}
          zoom={13}
          scrollWheelZoom={true}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onLocationSelect={handleMapClick} />
          <FlyTo lat={flyLat} lng={flyLng} zoom={flyZoom} />
          {position && <Marker position={position} />}
        </MapContainer>
      </div>

      <p className="text-xs text-gray-400">
        Search for a location or click on the map to set the pin.
        {position && (
          <span className="ml-1 text-gray-500">
            ({position[0].toFixed(4)}, {position[1].toFixed(4)})
          </span>
        )}
      </p>
    </div>
  );
}
