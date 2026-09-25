import { useState } from 'react';
import Map from './Map';

const REPORT_TYPES = [
  { value: 'AGGRESSIVE_DOG', label: 'Aggressive Dog' },
  { value: 'SMALL_PUPPIES', label: 'Small Puppies' },
  { value: 'NIGHT_BARKING', label: 'Night Barking' },
  { value: 'LARGE_DOG_POPULATION', label: 'Large Dog Population' },
  { value: 'INJURED_DOG', label: 'Injured Dog' },
  { value: 'STRAY_DOG', label: 'Stray Dog' },
  { value: 'OTHER', label: 'Other' },
];

export default function ReportForm({ initialData = {}, onSubmit, loading = false }) {
  const [form, setForm] = useState({
    type: initialData.type || '',
    description: initialData.description || '',
    dogCount: initialData.dogCount || 1,
    latitude: initialData.latitude || '',
    longitude: initialData.longitude || '',
    address: initialData.address || '',
  });
  const [errors, setErrors] = useState({});
  const [geoError, setGeoError] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(
    initialData.latitude && initialData.longitude
      ? { lat: parseFloat(initialData.latitude), lng: parseFloat(initialData.longitude) }
      : null
  );
  const [currentLocation, setCurrentLocation] = useState(null);
  const [showMapPicker, setShowMapPicker] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    setForm((prev) => ({
      ...prev,
      latitude: location.lat.toFixed(6),
      longitude: location.lng.toFixed(6),
    }));
    setShowMapPicker(true);
  };

  const handleUseCurrentLocation = () => {
    setGeoError('');

    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setCurrentLocation(location);
        setSelectedLocation(location);
        setForm((prev) => ({
          ...prev,
          latitude: location.lat.toFixed(6),
          longitude: location.lng.toFixed(6),
        }));
        setShowMapPicker(true);
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setGeoError('Location permission denied. Please allow location access in your browser.');
            break;
          case error.POSITION_UNAVAILABLE:
            setGeoError('Location information is unavailable. Please try again.');
            break;
          case error.TIMEOUT:
            setGeoError('Location request timed out. Please try again.');
            break;
          default:
            setGeoError('Unable to retrieve your location. Please select on map instead.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const validate = () => {
    const newErrors = {};
    if (!form.type) newErrors.type = 'Report type is required';
    if (!form.description.trim()) newErrors.description = 'Description is required';
    const count = parseInt(form.dogCount, 10);
    if (isNaN(count) || count < 1) newErrors.dogCount = 'Must be a positive number';
    if (!form.latitude) newErrors.latitude = 'Latitude is required';
    if (!form.longitude) newErrors.longitude = 'Longitude is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      ...form,
      dogCount: parseInt(form.dogCount, 10),
      latitude: parseFloat(form.latitude),
      longitude: parseFloat(form.longitude),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Report Type *</label>
        <select
          name="type"
          value={form.type}
          onChange={handleChange}
          className="input-field"
        >
          <option value="">Select type...</option>
          {REPORT_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={4}
          className="input-field"
          placeholder="Describe the dog problem in detail..."
        />
        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Number of Dogs *</label>
        <input
          type="number"
          name="dogCount"
          value={form.dogCount}
          onChange={handleChange}
          min="1"
          className="input-field"
        />
        {errors.dogCount && <p className="text-red-500 text-sm mt-1">{errors.dogCount}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Latitude *</label>
          <input
            type="text"
            name="latitude"
            value={form.latitude}
            onChange={handleChange}
            className="input-field"
            placeholder="12.9716"
            readOnly={!!selectedLocation}
          />
          {errors.latitude && <p className="text-red-500 text-sm mt-1">{errors.latitude}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Longitude *</label>
          <input
            type="text"
            name="longitude"
            value={form.longitude}
            onChange={handleChange}
            className="input-field"
            placeholder="77.5946"
            readOnly={!!selectedLocation}
          />
          {errors.longitude && <p className="text-red-500 text-sm mt-1">{errors.longitude}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
        <input
          type="text"
          name="address"
          value={form.address}
          onChange={handleChange}
          className="input-field"
          placeholder="Street, area, city..."
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={handleUseCurrentLocation} className="btn-secondary">
          📍 Use My Current Location
        </button>
        <button
          type="button"
          onClick={() => setShowMapPicker(!showMapPicker)}
          className="btn-secondary"
        >
          🗺️ Select Location on Map
        </button>
      </div>

      {geoError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {geoError}
        </div>
      )}

      {showMapPicker && (
        <div>
          <p className="text-sm text-gray-600 mb-2">
            Click on the map to select a location, or use your current location.
          </p>
          <Map
            selectable
            selectedLocation={selectedLocation}
            currentLocation={currentLocation}
            onLocationSelect={handleLocationSelect}
            height="350px"
          />
        </div>
      )}

      <button type="submit" disabled={loading} className="btn-primary w-full sm:w-auto">
        {loading ? 'Submitting...' : 'Submit Report'}
      </button>
    </form>
  );
}

export { REPORT_TYPES };
