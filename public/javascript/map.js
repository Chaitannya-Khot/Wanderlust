// Ensure the map container exists
const mapElement = document.getElementById('map');
if (mapElement) {
    // Initialize the map (default world view)
    const map = L.map('map').setView([0, 0], 2); // Default view (world map)

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 19,
    }).addTo(map);

    // Check if coordinates are valid
    if (latitude !== 'null' && longitude !== 'null' && !isNaN(latitude) && !isNaN(longitude)) {
        // Set the map view to the provided coordinates
        map.setView([latitude, longitude], 13);

        // Add a marker at the geocoded location
        L.marker([latitude, longitude])
            .addTo(map)
            .bindPopup(`<b>${listingLocation}</b>`) // Display the location name
            .openPopup();
    } else {
        console.error("Invalid or missing coordinates: ", latitude, longitude);
        alert("Coordinates for this listing are missing or invalid.");
    }
} else {
    console.error('Map container not found');
}
