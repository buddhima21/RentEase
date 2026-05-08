import { MapContainer as LeafletMap, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Sri Lanka approximate center
export const SRI_LANKA_CENTER = [7.8731, 80.7718];
export const SRI_LANKA_ZOOM = 8;

// Colombo/Malabe area defaults (used when focusing on a city)
export const COLOMBO_CENTER = [6.9271, 79.8612];
export const COLOMBO_ZOOM = 12;

/**
 * BaseMapContainer — a thin wrapper around react-leaflet's MapContainer
 * that pre-configures the OpenStreetMap tile layer.
 *
 * @param {Object} props
 * @param {[number, number]} [props.center]   - [lat, lng] initial center
 * @param {number}           [props.zoom]     - Initial zoom level
 * @param {string}           [props.style]    - Inline style string for the container div
 * @param {string}           [props.className]- Class names for the container
 * @param {React.ReactNode}  [props.children] - Markers, layers, etc.
 */
export default function BaseMapContainer({
    center = COLOMBO_CENTER,
    zoom = COLOMBO_ZOOM,
    style,
    className,
    children,
    ...rest
}) {
    return (
        <LeafletMap
            center={center}
            zoom={zoom}
            style={style || { width: "100%", height: "100%" }}
            className={className}
            scrollWheelZoom
            {...rest}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {children}
        </LeafletMap>
    );
}
