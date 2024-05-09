import { useEffect, useRef, useState } from "react";
import { MapProps } from ".";
import classes from "./Map.module.css";
import "mapbox-gl/dist/mapbox-gl.css";
import Mapbox, { MapRef, Marker, NavigationControl, Popup } from "react-map-gl";

const Map = ({ markers, onMarkerClicked, popupContent: popupContent }: MapProps) => {
  const [bounds, setBounds] = useState<[[number, number], [number, number]] | undefined>(undefined);
  const mapRef = useRef<MapRef | null>(null);

  useEffect(() => {
    if (!markers.length) return;

    let minLat = Infinity,
      minLng = Infinity,
      maxLat = -Infinity,
      maxLng = -Infinity;

    markers.forEach(marker => {
      const { lat, lng } = marker;
      minLat = Math.min(minLat, lat);
      minLng = Math.min(minLng, lng);
      maxLat = Math.max(maxLat, lat);
      maxLng = Math.max(maxLng, lng);
    });

    const newBounds: [[number, number], [number, number]] = [
      [minLng, minLat],
      [maxLng, maxLat],
    ];
    setBounds(newBounds);
    // mapRef.current?.fitBounds(newBounds);
  }, [markers.length]);

  return (
    <main className={classes.mainStyle}>
      {/* {markers ? ( */}
      <Mapbox
        ref={mapRef}
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        style={{ width: "100%", height: "100%" }}
        latitude={bounds ? (bounds[0][1] + bounds[1][1]) / 2 : 36.7783}
        longitude={bounds ? (bounds[0][0] + bounds[1][0]) / 2 : -119.417931}
        initialViewState={{
          bounds,
          zoom: 5,
          fitBoundsOptions: { padding: 64 },
        }}
      >
        <NavigationControl showCompass={false} />
        {markers?.map(marker => (
          <>
            <Marker
              key={"marker_" + marker.id}
              latitude={marker.lat}
              longitude={marker.lng}
              onClick={() => onMarkerClicked?.(marker)}
            />
            {popupContent ? (
              <Popup
                className="[&_.mapboxgl-popup-tip]:!border-t-secondary [&_.mapboxgl-popup-content]:bg-secondary [&_.mapboxgl-popup-content]:p-1"
                key={"popup_" + marker.id}
                latitude={marker.lat}
                longitude={marker.lng}
                closeButton={false}
                closeOnClick={false}
                offset={[0, -38] as [number, number]}
              >
                {popupContent(marker)}
              </Popup>
            ) : (
              <></>
            )}
          </>
        ))}
      </Mapbox>
      {/* ) : (
        <div className="w-full h-full flex flex-row justify-center items-center">
          <span className="loading loading-bars loading-lg" />
        </div>
      )} */}
    </main>
  );
};

export default Map;
