const fetch = require('node-fetch');

geocode = async (location) => {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`;
    try {
        const response = await fetch(url);
        const data = await response.json();

        console.log("Geocoding response:", data); // Debugging: Ensure valid API response
        if (data.length > 0) {
            const lat = parseFloat(data[0].lat);
            const lng = parseFloat(data[0].lon);
            return { lat, lng };
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error fetching geocoding data:", error);
        return null;
    }
};

module.exports = geocode;

