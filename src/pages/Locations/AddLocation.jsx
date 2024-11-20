import React, { useState, useEffect } from 'react';
import { MapContainer, Marker, Popup, TileLayer, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import PlacesAutoComplete from 'components/PlacesAutoComplete';
import MarkerIcon from 'assets/images/marker-icon.png';
import { Icon } from 'leaflet';

function AddLocation() {
  const [position, setPosition] = useState([51.505, -0.09]);
  const [name, setName] = useState([51.505, -0.09]);
  const [mapKey, setMapKey] = useState(Date.now()); // Key for MapContainer

  useEffect(() => {
    setMapKey(Date.now());
  }, [position]);

  const blueIcon = new Icon({
    iconUrl: MarkerIcon,
    iconAnchor: [12, 25],
    popupAnchor: [-3, -76],
  });
 
  return (
    <div className="row">
      <div className="col-md-7">
        <MapContainer key={mapKey} center={position} zoom={18} scrollWheelZoom={false} style={{ height: "70vh" }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {position && <Marker key={position.toString()} icon={blueIcon} position={position}>
            <Tooltip direction="bottom" offset={[0, 20]} opacity={1} permanent>
              {name ? name : 'N/A'}
            </Tooltip>
          </Marker>}
        </MapContainer>
      </div>
      <div className="col-md-5 mt-4">
        <h1>Add new location</h1>
        <p>
          You must need permission in that location in order to add it.
        </p>
        <PlacesAutoComplete setPosition={setPosition} setName={setName} />
      </div>
    </div>
  );
}


export default AddLocation;
