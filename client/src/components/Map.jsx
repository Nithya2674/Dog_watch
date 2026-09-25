import { useCallback, useMemo, useState } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { TYPE_LABELS } from './ReportCard';
import StatusBadge from './StatusBadge';

const BANGALORE_CENTER = { lat: 12.9716, lng: 77.5946 };

const MARKER_COLORS = {
  AGGRESSIVE_DOG: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
  SMALL_PUPPIES: 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png',
  NIGHT_BARKING: 'http://maps.google.com/mapfiles/ms/icons/purple-dot.png',
  LARGE_DOG_POPULATION: 'http://maps.google.com/mapfiles/ms/icons/orange-dot.png',
  INJURED_DOG: 'http://maps.google.com/mapfiles/ms/icons/pink-dot.png',
  STRAY_DOG: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
  OTHER: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
};

const mapContainerStyle = { width: '100%', height: '100%' };

export default function Map({
  reports = [],
  selectable = false,
  selectedLocation = null,
  onLocationSelect,
  currentLocation = null,
  height = '500px',
  filterType = null,
}) {
  const [activeMarker, setActiveMarker] = useState(null);
  const [map, setMap] = useState(null);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey || '',
  });

  const filteredReports = useMemo(() => {
    if (!filterType || filterType === 'ALL') return reports;
    return reports.filter((r) => r.type === filterType);
  }, [reports, filterType]);

  const onMapClick = useCallback(
    (e) => {
      if (selectable && onLocationSelect) {
        onLocationSelect({
          lat: e.latLng.lat(),
          lng: e.latLng.lng(),
        });
      }
    },
    [selectable, onLocationSelect]
  );

  const onLoad = useCallback((mapInstance) => {
    setMap(mapInstance);
  }, []);

  const panTo = useCallback(
    (location) => {
      if (map && location) {
        map.panTo(location);
        map.setZoom(15);
      }
    },
    [map]
  );

  if (loadError) {
    return (
      <div className="flex items-center justify-center bg-gray-100 rounded-lg" style={{ height }}>
        <p className="text-red-600 p-4 text-center">
          Failed to load Google Maps. Please check your API key in .env file.
        </p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center bg-gray-100 rounded-lg" style={{ height }}>
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!apiKey || apiKey === 'your_google_maps_api_key') {
    return (
      <div className="flex items-center justify-center bg-gray-100 rounded-lg" style={{ height }}>
        <p className="text-amber-700 p-4 text-center">
          Please set VITE_GOOGLE_MAPS_API_KEY in client/.env to enable the map.
        </p>
      </div>
    );
  }

  const center = selectedLocation || currentLocation || BANGALORE_CENTER;

  return (
    <div className="rounded-lg overflow-hidden border border-gray-200" style={{ height }}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={12}
        onLoad={onLoad}
        onClick={onMapClick}
        options={{
          streetViewControl: false,
          mapTypeControl: true,
          fullscreenControl: true,
        }}
      >
        {filteredReports.map((report) => (
          <Marker
            key={report.id}
            position={{ lat: report.latitude, lng: report.longitude }}
            icon={MARKER_COLORS[report.type]}
            onClick={() => setActiveMarker(report.id)}
          />
        ))}

        {selectedLocation && (
          <Marker
            position={selectedLocation}
            icon="http://maps.google.com/mapfiles/ms/icons/green-dot.png"
          />
        )}

        {currentLocation && (
          <Marker
            position={currentLocation}
            icon="http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
          />
        )}

        {activeMarker && (
          <InfoWindow
            position={{
              lat: filteredReports.find((r) => r.id === activeMarker)?.latitude,
              lng: filteredReports.find((r) => r.id === activeMarker)?.longitude,
            }}
            onCloseClick={() => setActiveMarker(null)}
          >
            <div className="p-1 max-w-xs">
              {(() => {
                const report = filteredReports.find((r) => r.id === activeMarker);
                if (!report) return null;
                return (
                  <>
                    <h4 className="font-semibold text-sm">
                      {TYPE_LABELS[report.type] || report.type}
                    </h4>
                    <p className="text-xs text-gray-600 mt-1">{report.description}</p>
                    <p className="text-xs mt-1">Dogs: {report.dogCount}</p>
                    <div className="mt-1">
                      <StatusBadge status={report.status} />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </p>
                  </>
                );
              })()}
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
}

export { BANGALORE_CENTER };
