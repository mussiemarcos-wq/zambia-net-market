"use client";

import dynamic from "next/dynamic";

const ListingMap = dynamic(() => import("@/components/ListingMap"), { ssr: false });

export default function ListingLocationMap({
  latitude,
  longitude,
  title,
}: {
  latitude: number;
  longitude: number;
  title: string;
}) {
  return <ListingMap latitude={latitude} longitude={longitude} title={title} />;
}
