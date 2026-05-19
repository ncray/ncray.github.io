async function init() {
    renderItinerary();
}

const EXCH_RATE = 150; // 1 USD = 150 JPY

function renderItinerary() {
    const container = document.getElementById('itinerary-container');
    const transitMap = new Map();
    for (const t of itineraryData.transit) {
        transitMap.set(t.id, t);
    }
    
    // Add Initial Transit (NRT to Narita Omotesando)
    const initialTransit = transitMap.get(0);
    if (initialTransit) {
        container.appendChild(createTransitEl(initialTransit));
    }

    itineraryData.itinerary.forEach((phase, index) => {
        const phaseEl = document.createElement('section');
        phaseEl.className = 'phase-section';
        phaseEl.id = `phase-${phase.phase}`;
        
        const activityCards = phase.activities.map(act => `
            <div class="activity-card">
                <img src="${act.image}" alt="${act.name}" class="activity-image">
                <div class="activity-info">
                    <h4>${act.name}</h4>
                    <p>${act.reason}</p>
                </div>
            </div>
        `).join('');

        let dayTripsHtml = '';
        if (phase.dayTrips) {
            const dayTripCards = phase.dayTrips.map(trip => `
                <div class="day-trip-item">
                    <div class="day-trip-title">
                        <span>${trip.title}</span>
                        <span class="mode-tag">${trip.mode}</span>
                    </div>
                    <ul class="day-trip-details">
                        ${trip.details.map(detail => `<li>${detail}</li>`).join('')}
                    </ul>
                </div>
            `).join('');
            
            dayTripsHtml = `
                <div class="day-trips-section">
                    <h3>Detailed Transit & Day Trip Logistics</h3>
                    <div class="day-trip-grid">
                        ${dayTripCards}
                    </div>
                </div>
            `;
        }

        phaseEl.innerHTML = `
            <div class="phase-header">
                <div class="phase-meta">Phase ${phase.phase} • ${phase.nights} Nights</div>
                <h2 class="phase-title">${phase.title}</h2>
                <div class="phase-dates">${phase.dates} • ${phase.location}</div>
            </div>
            
            <p class="phase-desc">${phase.description}</p>
            
            <div class="tip-box">
                <strong>🧸 Toddler Tip:</strong> ${phase.toddlerTip}
            </div>

            ${dayTripsHtml}

            <div id="map-${phase.phase}" class="map-container"></div>
            
            <h3>Potential Activities</h3>
            <div class="activity-grid">
                ${activityCards}
            </div>
        `;
        
        container.appendChild(phaseEl);
        
        // Initialize map for this phase
        initPhaseMap(phase);

        // Add transit to next phase
        const nextTransit = transitMap.get(index + 1);
        if (nextTransit) {
            container.appendChild(createTransitEl(nextTransit));
        }
    });
}

function createTransitEl(transit) {
    const el = document.createElement('div');
    el.className = 'transit-container';
    
    const costUSD = (transit.costJPY / EXCH_RATE).toFixed(2);
    const optionsHtml = transit.options.map(opt => `<li>${opt}</li>`).join('');

    el.innerHTML = `
        <div class="transit-card">
            <div class="transit-badge">Transit: ${transit.from} → ${transit.to}</div>
            <table class="transit-table">
                <thead>
                    <tr>
                        <th>Travel Time</th>
                        <th>Recommendation</th>
                        <th>Options</th>
                        <th>Est. Price</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td data-label="Travel Time"><strong>${transit.time}</strong></td>
                        <td data-label="Recommendation"><span class="recommendation-tag">${transit.recommendation}</span></td>
                        <td data-label="Options"><ul class="transit-options">${optionsHtml}</ul></td>
                        <td data-label="Est. Price">
                            <div class="price-jpy">¥${transit.costJPY.toLocaleString()}</div>
                            <div class="price-usd">$${costUSD} USD</div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;
    return el;
}

function initPhaseMap(phase) {
    const mapId = `map-${phase.phase}`;
    const mapElement = document.getElementById(mapId);
    
    // Initialize Leaflet map
    const map = L.map(mapElement, {
        zoomControl: true,
        scrollWheelZoom: false, // Better for long scrolling pages
        attributionControl: false
    });

    // Add CartoDB Voyager tiles (Clean, light aesthetic)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
    }).addTo(map);

    const markers = [];

    // Add Accommodation Marker
    phase.accommodations.forEach(acc => {
        const marker = createLabeledMarker(map, acc.coords, acc.name, '#1a2a3a');
        markers.push(marker);
    });

    // Add Activity Markers
    phase.activities.forEach(act => {
        const marker = createLabeledMarker(map, act.coords, act.name, '#e63946');
        markers.push(marker);
    });

    // Fit map to markers
    const group = L.featureGroup(markers).addTo(map);
    map.fitBounds(group.getBounds().pad(0.2));
}

function createLabeledMarker(map, position, title, color) {
    const icon = L.divIcon({
        className: 'custom-div-icon',
        html: `
            <div class="marker-container">
                <div class="marker-label">${title}</div>
                <div class="marker-pin" style="background-color: ${color}"></div>
            </div>
        `,
        iconSize: [0, 0], 
        iconAnchor: [0, 0] 
    });

    return L.marker(position, { icon: icon }).addTo(map);
}

// Start the app
window.onload = init;
