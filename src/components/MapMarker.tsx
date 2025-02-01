import React, { useEffect } from "react";
import { Place } from "../types/Place";

interface Props {
  place: Place;
  map: any;
}

const MapMarker: React.FC<Props> = ({ place, map }) => {
  useEffect(() => {
    const marker = new window.naver.maps.Marker({
      position: new window.naver.maps.LatLng(place.latitude, place.longitude),
      map: map,
      title: place.name,
    });

    return () => marker.setMap(null);
  }, [place, map]);

  return null;
};

export default MapMarker;
