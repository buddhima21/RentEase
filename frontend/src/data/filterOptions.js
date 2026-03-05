export const propertyTypes = ["Room", "Annex", "House", "Apartment"];

export const genderOptions = ["Any", "Male", "Female"];

export const amenityOptions = ["WiFi", "AC", "Parking", "Furnished", "Hot Water", "CCTV"];

export const distanceOptions = [
    { label: "Any Distance", value: Infinity },
    { label: "Within 1 km", value: 1 },
    { label: "Within 2 km", value: 2 },
    { label: "Within 5 km", value: 5 },
];

export const sortOptions = [
    { label: "Featured First", value: "featured" },
    { label: "Price: Low to High", value: "price-asc" },
    { label: "Price: High to Low", value: "price-desc" },
    { label: "Distance: Nearest", value: "distance" },
    { label: "Rating: Highest", value: "rating" },
];
