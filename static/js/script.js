function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.style.display = 'none';
    });

    document.getElementById(pageId).style.display = 'block';
}

document.addEventListener('DOMContentLoaded', function() {
    showPage('about');
});

var map = L.map('map', {
    zoomControl: false,          
    scrollWheelZoom: false,      
    dragging: false
}).setView([20, 0], 3);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

var indiaBounds = L.latLngBounds(
    L.latLng(6.4621, 68.1118), 
    L.latLng(37.0902, 97.4026)  
);

var indiaMap = L.map('india-map', {
    center: [20.5937, 78.9629], 
    zoom: 5,
    minZoom: 5,    
    maxZoom: 5,
    maxBounds: indiaBounds, 
    maxBoundsViscosity: 1.0,
    zoomControl: false,          
    scrollWheelZoom: false,      
    dragging: false
});
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(indiaMap);

function convertToFloat(coord) {
    let value = parseFloat(coord);
    if (coord.includes('S') || coord.includes('W')) {
        value = -value;
    }
    return value;
}

function fetchData(year) {
    fetch(`/get_data/${year}`)
        .then(response => response.json())
        .then(data => {
            data.forEach(location => {
                var temp = parseFloat(location.temp);
                var color = getColor(temp);
                var lat = convertToFloat(location.lat);
                var lon = convertToFloat(location.lon);

                L.circleMarker([lat, lon], {
                    radius: Math.max(5, temp / 5),
                    color: color,
                    fillColor: color,
                    fillOpacity: 0.7
                }).bindPopup(
                    `City: ${location.city}<br>
                     Country: ${location.country}<br>
                     Temperature: ${temp}°C`
                ).addTo(map);
            });
        })
        .catch(error => console.error("Error fetching data:", error));
}

function fetchIndiaData() {
    fetch('/get_india_data')
        .then(response => response.json())
        .then(states => {

            states.forEach(state => {
                var lat = convertToFloat(state.lat);
                var lon = convertToFloat(state.lon);
                var category = state.category;
                var airPollution = state.air_pollution;
                var carbonEmissions = state.carbon_emissions;
                var healthcare = state.healthcare;
                var groundwater = state.groundwater;
                var population = state.population;
                var rainfall = state.rainfall;
                var temperature = state.temperature;
                var heatwave = state.heatwave;

                L.circleMarker([lat, lon], {
                    radius: 10,
                    color: 'orange',
                    fillColor: 'red',
                    fillOpacity: 0.8
                }).addTo(indiaMap)
                    .bindPopup(
                        `<strong>${state.state}</strong><br>
                        Category: ${category}<br>
                        <strong>Heatwave Susceptibility Score: ${heatwave}</strong><br>
                        Air Pollution Index: ${airPollution}<br>
                        Carbon Emission Impact: ${carbonEmissions}<br>
                        Wellness and Healthcare Index: ${healthcare}<br>
                        Groundwater Sustainability Score: ${groundwater}<br>
                        Population Density Index: ${population}<br>
                        Rainfall Sufficiency Index: ${rainfall}<br>
                        Temperature Variation Score: ${temperature}`
                    );
            });
        })
        .catch(error => console.error("Error fetching India data:", error));
}

function getColor(temp) {
    return temp > 30 ? 'red' :
           temp > 20 ? 'orange' :
           temp > 10 ? 'yellow' :
           temp > 0  ? 'lightgreen' :
                       'blue';
}

var yearSelector = document.getElementById('year-selector');
var dropdownLabel = document.getElementById('dropdown-label');

fetchData(1900);

for (var i = 1850; i <= 2049; i++) {
    var option = document.createElement('option');
    option.value = i;
    option.innerText = i;
    yearSelector.appendChild(option);
}

yearSelector.addEventListener('change', function () {
    var selectedYear = yearSelector.value;

    dropdownLabel.innerText = `Selected Year: ${selectedYear}`;

    map.eachLayer(layer => {
        if (layer instanceof L.CircleMarker) {
            map.removeLayer(layer);
        }
    });

    fetchData(selectedYear);
});

fetchIndiaData();

document.getElementById('submitPromptButton').addEventListener('click', async () => {
    const userPrompt = document.getElementById('userPrompt').value;
    const loadingSpinner = document.getElementById('submitLoading');

    if (!userPrompt) {
        alert("Please enter a user prompt.");
        return;
    }

    loadingSpinner.style.display = 'inline-block';

    try {
        const response = await fetch('/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({userPrompt })
        });

        const data = await response.json();
        const backendResponse = document.getElementById('backendResponse');

        if (response.ok) {
            backendResponse.value = data.response || "No response.";
        } else {
            backendResponse.value = "Error: " + (data.error || "Failed to get response.");
        }

        backendResponse.style.height = "auto"; 
        backendResponse.style.height = backendResponse.scrollHeight + "px";

    } catch (error) {
        console.error(error);
    } finally {
        loadingSpinner.style.display = 'none';
    }
});

document.getElementById('submitButton').addEventListener('click', async () => {
    const API = document.getElementById('API').value;
    const CEIS = document.getElementById('CEIS').value;
    const WHI = document.getElementById('WHI').value;
    const GSS = document.getElementById('GSS').value;
    const PDI = document.getElementById('PDI').value;
    const RSI = document.getElementById('RSI').value;
    const TVS = document.getElementById('TVS').value;

    if (!API || !CEIS || !WHI || !GSS || !PDI || !RSI || !TVS) {
        alert("All fields must be filled.");
        return;
    }
    
    if (API < 0 || API > 1 || CEIS < 0 || CEIS > 1 || WHI < 0 || WHI > 1 || GSS < 0 || GSS > 1 || PDI < 0 || PDI > 1 || RSI < 0 || RSI > 1 || TVS < 0 || TVS > 1) {
        alert("Please enter values between 0 and 1.");
        return;
    }

    try {
        const response = await fetch('/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({API,CEIS,WHI,GSS,PDI,RSI,TVS})
        });

        const data = await response.json();
        const predictResponse = document.getElementById('predictResponse');

        if (response.ok) {
            const predictedHSS = data["Predicted HSS"];
            const predictedCategory = data["Predicted Category"];
            predictResponse.value = `Predicted HSS: ${predictedHSS}\nPredicted Category: ${predictedCategory}`;
        } else {
            predictResponse.value = "Error: " + (data.error || "Failed to get response.");
        }

        predictResponse.style.height = "auto"; 
        predictResponse.style.height = predictResponse.scrollHeight + "px";

    } catch (error) {
        console.error(error);
    }
});

document.getElementById('resetButton').addEventListener('click', function() {
    document.getElementById('API').value = '';
    document.getElementById('CEIS').value = '';
    document.getElementById('WHI').value = '';
    document.getElementById('GSS').value = '';
    document.getElementById('PDI').value = '';
    document.getElementById('RSI').value = '';
    document.getElementById('TVS').value = '';

    const predictResponse = document.getElementById('predictResponse');
    predictResponse.value = '';

    predictResponse.style.height = "auto"; 
});