import { Marker, Popup } from "react-leaflet";
import { Link } from "react-router-dom";
import L from "leaflet";

// Fix Leaflet's default icon paths broken by Vite bundler
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

/**
 * Creates a custom price-bubble icon for a map marker.
 * @param {string} label - Price label text (e.g. "25k")
 * @param {boolean} highlighted - Whether the marker is highlighted/active
 */
function createPriceIcon(label, highlighted = false) {
    const bg = highlighted ? "#26C289" : "#1a2e25";
    const html = `
        <div style="
            background: ${bg};
            color: white;
            font-size: 11px;
            font-weight: 800;
            padding: 4px 9px;
            border-radius: 20px;
            white-space: nowrap;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            border: 2px solid white;
            font-family: 'Inter', sans-serif;
            letter-spacing: 0.3px;
            transition: all 0.2s;
        ">LKR ${label}</div>
    `;
    return L.divIcon({
        html,
        className: "",
        iconAnchor: [30, 16],
        popupAnchor: [0, -20],
    });
}

const FALLBACK_IMAGE = "https://placehold.co/400x220/f1f5f9/94a3b8?text=No+Image";

/**
 * A Leaflet Marker with a styled popup card for a property.
 *
 * @param {Object} props
 * @param {Object} props.property - Normalised property object
 * @param {boolean} [props.highlighted] - Highlight this marker
 */
export default function PropertyMapMarker({ property, highlighted = false }) {
    if (!property.lat || !property.lng) return null;

    const label = property.price
        ? `${new Intl.NumberFormat("en-LK", { notation: "compact", maximumFractionDigits: 0 }).format(Number(property.price))}`
        : "?";

    const icon = createPriceIcon(label, highlighted);
    const imgSrc = property.image || (property.imageUrls?.[0]) || FALLBACK_IMAGE;

    return (
        <Marker
            position={[property.lat, property.lng]}
            icon={icon}
        >
            <Popup
                minWidth={260}
                maxWidth={280}
                className="rentease-popup"
            >
                <div style={{ fontFamily: "'Inter', sans-serif" }}>
                    <img
                        src={imgSrc}
                        alt={property.title}
                        onError={(e) => { e.target.src = FALLBACK_IMAGE; }}
                        style={{
                            height: "140px",
                            objectFit: "cover",
                            borderRadius: "10px 10px 0 0",
                            display: "block",
                            margin: "-14px -20px 10px -20px",
                            width: "calc(100% + 40px)",
                        }}
                    />
                    <div style={{ padding: "0 2px" }}>
                        <p style={{
                            fontSize: "13px",
                            fontWeight: 800,
                            color: "#0f172a",
                            margin: "0 0 2px 0",
                            lineHeight: 1.3,
                            overflow: "hidden",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                        }}>
                            {property.title}
                        </p>
                        <p style={{ fontSize: "11px", color: "#64748b", margin: "0 0 8px 0" }}>
                            📍 {property.city || property.address}
                        </p>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <span style={{
                                fontSize: "14px",
                                fontWeight: 800,
                                color: "#26C289",
                            }}>
                                LKR {new Intl.NumberFormat("en-LK").format(Number(property.price) || 0)}
                                <span style={{ fontSize: "10px", fontWeight: 500, color: "#94a3b8" }}>/mo</span>
                            </span>
                            <Link
                                to={`/property/${property.id}`}
                                style={{
                                    background: "#26C289",
                                    color: "white",
                                    padding: "5px 12px",
                                    borderRadius: "8px",
                                    fontSize: "11px",
                                    fontWeight: 700,
                                    textDecoration: "none",
                                    display: "inline-block",
                                }}
                            >
                                View →
                            </Link>
                        </div>
                    </div>
                </div>
            </Popup>
        </Marker>
    );
}
