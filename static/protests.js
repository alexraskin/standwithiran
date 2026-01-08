// Initialize map centered on Iran
const map = L.map('map').setView([32.4279, 53.6880], 6);

// Add tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 18
}).addTo(map);

// Create marker cluster group
const markers = L.markerClusterGroup({
    maxClusterRadius: 50,
    spiderfyOnMaxZoom: true,
    showCoverageOnHover: false,
    zoomToBoundsOnClick: true
});

// Fetch protest data from API
fetch('/api/protests')
    .then(response => response.json())
    .then(protests => {
        console.log(`Loaded ${protests.length} protests`);
        
        // Add markers for each protest
        protests.forEach(protest => {
            addProtestMarker(protest);
        });
        
        // Add all markers to map
        map.addLayer(markers);
    })
    .catch(error => {
        console.error('Error loading protest data:', error);
    });

function addProtestMarker(protest) {
    const color = protest.intensity === 'high' ? '#ef4444' : 
                 protest.intensity === 'medium' ? '#f59e0b' : '#10b981';
    
    const marker = L.circleMarker([protest.lat, protest.lng], {
        radius: protest.intensity === 'high' ? 12 : protest.intensity === 'medium' ? 8 : 6,
        fillColor: color,
        color: '#fff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8
    });

    let popupContent = `
        <div style="font-family: sans-serif; min-width: 200px;">
            <strong style="font-size: 1.1rem;">${protest.city}</strong>`;
    
    if (protest.province) {
        popupContent += `<br><span style="color: #64748b;">${protest.province}</span>`;
    }
    
    popupContent += `<br><span style="color: ${color};">●</span> ${protest.intensity.toUpperCase()} activity`;
    
    if (protest.participants > 0) {
        popupContent += `<br>👥 ~${protest.participants} participants`;
    }
    
    popupContent += `<br>📅 ${protest.date}`;
    
    if (protest.description) {
        popupContent += `<br><br><em style="font-size: 0.9rem; color: #475569;">${protest.description}</em>`;
    }
    
    if (protest.link) {
        popupContent += `<br><br><a href="${protest.link}" target="_blank" rel="noopener noreferrer" style="color: #3b82f6; text-decoration: none; font-size: 0.9rem;">🔗 View Source</a>`;
    } else if (protest.source) {
        popupContent += `<br><br><span style="font-size: 0.85rem; color: #64748b;">Source: ${protest.source}</span>`;
    }
    
    popupContent += `</div>`;
    
    marker.bindPopup(popupContent);
    markers.addLayer(marker);
}
