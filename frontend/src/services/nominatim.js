/**
 * Nominatim Geocoding Service
 * Uses OpenStreetMap's free Nominatim API — no API key required.
 * Fair use: max 1 request/second, no bulk geocoding.
 */

const NOMINATIM_BASE = "https://nominatim.openstreetmap.org";
const USER_AGENT = "RentEase/1.0 (rental-platform-sri-lanka)";
const CACHE_KEY_PREFIX = "rentease_geo_";
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

const defaultHeaders = {
    "Accept-Language": "en",
};

/**
 * Read a cached geocode result from localStorage.
 * Returns null if not cached or cache has expired.
 */
function readCache(address) {
    try {
        const raw = localStorage.getItem(CACHE_KEY_PREFIX + address);
        if (!raw) return null;
        const { lat, lng, displayName, ts } = JSON.parse(raw);
        if (Date.now() - ts > CACHE_TTL_MS) {
            localStorage.removeItem(CACHE_KEY_PREFIX + address);
            return null;
        }
        return { lat, lng, displayName };
    } catch {
        return null;
    }
}

/**
 * Write a geocode result to localStorage cache.
 */
function writeCache(address, result) {
    try {
        localStorage.setItem(
            CACHE_KEY_PREFIX + address,
            JSON.stringify({ ...result, ts: Date.now() })
        );
    } catch {
        // Storage quota exceeded — ignore silently
    }
}

/**
 * Forward geocode: convert an address string to lat/lng coordinates.
 * @param {string} address - Full address string (e.g. "123 New Kandy Road, Malabe, Sri Lanka")
 * @returns {Promise<{lat: number, lng: number, displayName: string} | null>}
 */
export async function geocodeAddress(address) {
    if (!address || address.trim().length < 5) return null;

    const cacheKey = address.trim().toLowerCase();

    // ✅ Return cached result immediately (no network call)
    const cached = readCache(cacheKey);
    if (cached) return cached;

    try {
        const params = new URLSearchParams({
            q: `${address}, Sri Lanka`,
            format: "json",
            limit: "1",
            countrycodes: "lk",
        });

        const res = await fetch(`${NOMINATIM_BASE}/search?${params}`, {
            headers: defaultHeaders,
        });

        if (!res.ok) return null;

        const data = await res.json();
        if (!data || data.length === 0) return null;

        const result = {
            lat: parseFloat(data[0].lat),
            lng: parseFloat(data[0].lon),
            displayName: data[0].display_name,
        };

        // ✅ Cache for next visit (no waiting next time)
        writeCache(cacheKey, result);
        return result;
    } catch (err) {
        console.error("[Nominatim] geocodeAddress failed:", err);
        return null;
    }
}

/**
 * Reverse geocode: convert lat/lng coordinates to a human-readable address.
 * @param {number} lat
 * @param {number} lng
 * @returns {Promise<string | null>} Display address or null
 */
export async function reverseGeocode(lat, lng) {
    try {
        const params = new URLSearchParams({
            lat: String(lat),
            lon: String(lng),
            format: "json",
        });

        const res = await fetch(`${NOMINATIM_BASE}/reverse?${params}`, {
            headers: defaultHeaders,
        });

        if (!res.ok) return null;

        const data = await res.json();
        return data?.display_name || null;
    } catch (err) {
        console.error("[Nominatim] reverseGeocode failed:", err);
        return null;
    }
}

/**
 * Address autocomplete: returns a list of address suggestions for a partial query.
 * @param {string} query - Partial address string
 * @param {number} limit - Max number of results (default 5)
 * @returns {Promise<Array<{lat: number, lng: number, displayName: string, shortName: string}>>}
 */
export async function searchAddresses(query, limit = 5) {
    if (!query || query.trim().length < 3) return [];

    try {
        const params = new URLSearchParams({
            q: `${query}, Sri Lanka`,
            format: "json",
            limit: String(limit),
            countrycodes: "lk",
            addressdetails: "1",
        });

        const res = await fetch(`${NOMINATIM_BASE}/search?${params}`, {
            headers: defaultHeaders,
        });

        if (!res.ok) return [];

        const data = await res.json();
        return data.map((item) => {
            // Build a human-friendly short name from address components
            const addr = item.address || {};
            const parts = [
                addr.road || addr.pedestrian,
                addr.suburb || addr.neighbourhood,
                addr.city || addr.town || addr.village || addr.county,
            ].filter(Boolean);

            return {
                lat: parseFloat(item.lat),
                lng: parseFloat(item.lon),
                displayName: item.display_name,
                shortName: parts.join(", ") || item.display_name,
            };
        });
    } catch (err) {
        console.error("[Nominatim] searchAddresses failed:", err);
        return [];
    }
}
