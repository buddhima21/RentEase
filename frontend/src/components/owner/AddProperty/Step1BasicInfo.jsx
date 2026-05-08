import React, { useState, useRef, useCallback, useEffect } from 'react';

const Step1BasicInfo = ({ formData, updateFormData, nextStep }) => {
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [previewMap, setPreviewMap] = useState(null); // {lat, lng, label}
  const [MapComponents, setMapComponents] = useState(null);
  const debounceRef = useRef(null);
  const suggestionRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateFormData(name, value);
  };

  // Load Leaflet lazily once on mount
  useEffect(() => {
    Promise.all([
      import('../../../components/map/BaseMapContainer'),
      import('leaflet/dist/leaflet.css'),
    ]).then(([bmc]) => {
      setMapComponents({ BaseMapContainer: bmc.default });
    });
  }, []);

  // Nominatim autocomplete as owner types address
  const handleAddressInput = useCallback((e) => {
    const val = e.target.value;
    updateFormData('fullAddress', val);

    clearTimeout(debounceRef.current);
    if (val.trim().length < 3) {
      setAddressSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const { searchAddresses } = await import('../../../services/nominatim');
        const results = await searchAddresses(val, 5);
        setAddressSuggestions(results);
        setShowSuggestions(results.length > 0);
      } catch {
        setAddressSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 500);
  }, [updateFormData]);

  const handleSuggestionSelect = (suggestion) => {
    updateFormData('fullAddress', suggestion.shortName);
    updateFormData('latitude', suggestion.lat);
    updateFormData('longitude', suggestion.lng);
    setPreviewMap({ lat: suggestion.lat, lng: suggestion.lng, label: suggestion.shortName });
    setShowSuggestions(false);
    setAddressSuggestions([]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    nextStep();
  };

  const inputClasses =
    'w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 focus:bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-4 focus:ring-primary/10 focus:border-primary px-4 py-3.5 outline-none transition-all placeholder:text-slate-400 font-medium';
  const labelClasses = 'block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2';

  return (
    <div className="bg-white dark:bg-slate-900 p-8 md:p-12 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/60 max-w-3xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">Basic Information</h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium">Start by telling us the essential details about your property.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-1">
          <label className={labelClasses}>
            Property Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className={inputClasses}
            placeholder="e.g. Modern Annex near SLIIT Malabe"
          />
          <p className="text-xs text-slate-500 dark:text-slate-400 pt-1 font-medium pl-1">
            A catchy title helps your property stand out in searches.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className={labelClasses}>
              Category <span className="text-red-500">*</span>
            </label>
            <div className="relative group">
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className={`${inputClasses} appearance-none cursor-pointer`}
              >
                <option value="" disabled>Select category</option>
                <option value="single">Single Room</option>
                <option value="annex">Annex</option>
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-slate-400 group-hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-xl">expand_more</span>
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <label className={labelClasses}>
              Nearby University <span className="text-red-500">*</span>
            </label>
            <div className="relative group">
              <select
                name="nearbyUniversity"
                value={formData.nearbyUniversity}
                onChange={handleChange}
                required
                className={`${inputClasses} appearance-none cursor-pointer`}
              >
                <option value="" disabled>Select proximity</option>
                <option value="sliit">SLIIT (Malabe)</option>
                <option value="nsbm">NSBM (Homagama)</option>
                <option value="uom">University of Moratuwa</option>
                <option value="iit">IIT (Colombo)</option>
                <option value="horizon">Horizon Campus</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-slate-400 group-hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-xl">school</span>
              </div>
            </div>
          </div>
        </div>

        {/* Address field with Nominatim autocomplete */}
        <div className="space-y-1">
          <label className={labelClasses}>
            Full Address <span className="text-red-500">*</span>
          </label>
          <div className="relative group" ref={suggestionRef}>
            <input
              type="text"
              name="fullAddress"
              value={formData.fullAddress}
              onChange={handleAddressInput}
              onFocus={() => addressSuggestions.length > 0 && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              required
              className={`${inputClasses} pl-12 pr-10`}
              placeholder="No 123, New Kandy Road, Malabe"
              autoComplete="off"
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400 group-hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-[22px]">location_on</span>
            </div>
            {isSearching && (
              <div className="absolute inset-y-0 right-3 flex items-center">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {/* Autocomplete dropdown */}
            {showSuggestions && addressSuggestions.length > 0 && (
              <ul className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden max-h-64 overflow-y-auto">
                {addressSuggestions.map((s, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-primary/5 border-b border-slate-50 last:border-0 transition-colors"
                    onMouseDown={() => handleSuggestionSelect(s)}
                  >
                    <span className="material-symbols-outlined text-primary text-base mt-0.5 shrink-0">location_on</span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{s.shortName}</p>
                      <p className="text-xs text-slate-400 truncate">{s.displayName}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {previewMap && formData.latitude && (
            <div className="mt-3 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm" style={{ height: '200px' }}>
              {MapComponents ? (
                <AddressPreviewMap
                  BaseMapContainer={MapComponents.BaseMapContainer}
                  lat={previewMap.lat}
                  lng={previewMap.lng}
                  label={previewMap.label}
                />
              ) : (
                <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
          )}

          <p className="text-xs text-slate-500 dark:text-slate-400 pt-1 font-medium pl-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm text-primary">auto_fix_high</span>
            Start typing — address suggestions will appear automatically.
          </p>
        </div>

        <div className="space-y-1">
          <label className={labelClasses}>
            Property Description <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows="5"
            className={`${inputClasses} resize-none`}
            placeholder="Describe the facilities, environment, and rules (e.g. WiFi available, electricity bill included, for female students only...)"
          ></textarea>
          <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 pt-1 font-medium pl-1">
            <span>Minimum 50 characters recommended</span>
            <span className={formData.description?.length > 500 ? 'text-red-500' : ''}>
              {formData.description?.length || 0} / 500
            </span>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-100 dark:border-slate-700/50 flex flex-col sm:flex-row gap-4 justify-end items-center mt-10">
          <button
            type="button"
            className="px-8 py-3.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-50 dark:bg-slate-800/50 hover:border-slate-300 dark:border-slate-600 transition-all w-full sm:w-auto"
          >
            Save Draft
          </button>
          <button
            type="submit"
            className="bg-primary text-white px-10 py-3.5 rounded-xl font-bold hover:bg-primary/90 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 shadow-[0_8px_20px_rgb(29,188,96,0.30)] w-full sm:w-auto"
          >
            Next Step
            <span className="material-symbols-outlined text-xl">arrow_forward</span>
          </button>
        </div>
      </form>
    </div>
  );
};

/** Small preview map shown after address selection */
function AddressPreviewMap({ BaseMapContainer, lat, lng, label }) {
  const [MarkerComponents, setMarkerComponents] = useState(null);

  useEffect(() => {
    Promise.all([
      import('react-leaflet'),
      import('leaflet'),
    ]).then(([rl, L]) => {
      const icon = L.default.divIcon({
        html: `<div style="background:#26C289;color:white;padding:5px 10px;border-radius:20px;font-size:10px;font-weight:800;box-shadow:0 2px 6px rgba(0,0,0,0.25);border:2px solid white;font-family:Inter,sans-serif;white-space:nowrap;">📍 Your Property</div>`,
        className: '',
        iconAnchor: [55, 14],
        popupAnchor: [0, -18],
      });
      setMarkerComponents({ Marker: rl.Marker, icon });
    });
  }, []);

  return (
    <BaseMapContainer center={[lat, lng]} zoom={15} style={{ width: '100%', height: '100%' }}>
      {MarkerComponents && (
        <MarkerComponents.Marker position={[lat, lng]} icon={MarkerComponents.icon} />
      )}
    </BaseMapContainer>
  );
}

export default Step1BasicInfo;
