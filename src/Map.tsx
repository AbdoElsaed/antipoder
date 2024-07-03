import React, { useRef, useEffect, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import cat1Src from "./assets/cat-1.png";
import cat2Src from "./assets/cat-2.png";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

const getAntipode = (lat: number, lng: number) => {
  const antipodeLat = -lat;
  const antipodeLng = lng > 0 ? lng - 180 : lng + 180;
  return { lat: antipodeLat, lng: antipodeLng };
};

const MapComponent: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map>();

  const loadMarker = useCallback(
    (img: string, coordinates: number[], sourceId: string, layerId: string) => {
      const map = mapRef.current;

      if (map) {
        map.loadImage(img, (error, image) => {
          if (error) {
            console.error("Failed to load image:", error);
            return;
          }
          map.addImage(layerId, image as never);

          const sourceData = {
            type: "geojson",
            data: {
              type: "FeatureCollection",
              features: [
                {
                  type: "Feature",
                  geometry: {
                    type: "Point",
                    coordinates,
                  },
                },
              ],
            },
          };

          map.addSource(sourceId, sourceData as never);
          map.addLayer({
            id: layerId,
            type: "symbol",
            source: sourceId,
            layout: {
              "icon-image": layerId,
              "icon-size": 0.2,
            },
          });
        });
      }
    },
    []
  );

  const initializeMap = useCallback(() => {
    if (mapContainerRef.current && !mapRef.current) {
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/dark-v11",
        center: [0, 0],
        zoom: 3,
        attributionControl: false,
      });

      map.on("load", () => {
        // Check for user's location
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            map.flyTo({
              center: [longitude, latitude],
              zoom: 10,
            });
            loadMarker(
              cat1Src,
              [longitude, latitude],
              "originSource",
              "originPoint"
            );
          },
          (error) => {
            console.error("Geolocation error:", error);
          }
        );
      });

      mapRef.current = map;
    }
  }, [loadMarker]);

  const handleZoomToAntipode = useCallback(() => {
    const map = mapRef.current;
    if (map) {
      const center = map.getCenter();
      const antipode = getAntipode(center.lat, center.lng);
      map.flyTo({
        center: [antipode.lng, antipode.lat],
        zoom: 4,
        duration: 4000,
      });
      loadMarker(
        cat2Src,
        [antipode.lng, antipode.lat],
        "destSource",
        "destPoint"
      );
    }
  }, [loadMarker]);

  useEffect(() => {
    initializeMap();
  }, [initializeMap]);

  return (
    <>
      <button
        style={{ position: "absolute", top: 5, left: 5 }}
        onClick={handleZoomToAntipode}
      >
        Go to Antipode
      </button>
      <div ref={mapContainerRef} style={{ width: "100%", height: "100vh" }} />
    </>
  );
};

export default MapComponent;
