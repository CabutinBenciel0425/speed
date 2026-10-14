import { useEffect } from "react"
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet"
import { useMap } from "react-leaflet"

function MapController({ position }: { position: [number, number] }) {
  const map = useMap()

  useEffect(() => {
    map.setView(position, 15)
  }, [map, position])

  return null
}

function MapSizeController({ active }: { active: boolean }) {
  const map = useMap()

  useEffect(() => {
    if (!active) return

    map.invalidateSize()
  }, [map, active])

  return null
}

function MapClickHandler({
  onLocationChange,
}: {
  onLocationChange: (position: [number, number]) => void
}) {
  useMapEvents({
    click(event) {
      onLocationChange([event.latlng.lat, event.latlng.lng])
    },
  })

  return null
}

function MapComponent({
  position,
  onLocationChange,
  active,
  height,
}: {
  position: [number, number] | null
  onLocationChange?: (position: [number, number]) => void
  active: boolean
  height?: string
}) {
  const initialPosition: [number, number] = [14.577997, 121.036213]

  return (
    <>
      <MapContainer
        center={initialPosition}
        zoom={11.25}
        style={{ height: `${height ? height : "400px"}`, width: "100%" }}
      >
        <MapSizeController active={active} />
        {onLocationChange && (
          <MapClickHandler onLocationChange={onLocationChange} />
        )}

        {position && (
          <>
            <Marker position={position} />
            <MapController position={position} />
          </>
        )}

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      </MapContainer>
    </>
  )
}

export default MapComponent
