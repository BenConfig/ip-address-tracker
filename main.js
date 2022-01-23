// Get form elements
const IP_SEARCH_FIELD = document.getElementById('ip-search');
const IP_SEARCH_BTN = document.querySelector('.ip-search-btn');
const ERROR_MESSAGE = document.querySelector('.error-message');

// Get 'result' elements
const RESULTS_CONTAINER = document.getElementById('results')
const IP = document.getElementById('ip');
const SITUATION = document.getElementById('location');
const TIME_ZONE = document.getElementById('time-zone');
const ISP = document.getElementById('isp');

let searchedIP; 
let map;
let ipIsInvalid = false;

function loadIPInfo(e) {
    e.preventDefault(); // Prevents form from submitting
    RESULTS_CONTAINER.classList.add('loading');
    searchedIP = IP_SEARCH_FIELD.value.trim(); // If empty string, user's own details will display

    // Link to IP Geolocation API
    fetch(`https://geo.ipify.org/api/v2/country,city,vpn?apiKey=at_M6zB6Q33eEfpDsofNmXQsDtsDpW9T&ipAddress=${searchedIP}`)
        .then(response => response.json())
        .then(data => {
            if (data.ip) { // If IP address is valid
                // Pass in the 'Results' from the IP Geolocation API
                IP.innerText = data.ip;
                SITUATION.innerText = `${data.location.city}, ${data.location.region} ${data.location.postalCode}`;
                TIME_ZONE.innerText = 'UTC ' + data.location.timezone;
                ISP.innerText = data.isp;
                
                // If a map already exists, remove it
                map && map.remove();
                
                // Pass in the coordinates from the IP Geolocation API
                map = L.map('map').setView([data.location.lat, data.location.lng], 13);
                
                // Reposition the Leaflet buttons to avoid possible overlap with 'results' element
                map.zoomControl.setPosition('bottomright');

                // Load the Leaflet map tiles
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

                // Link to the marker icon in our design
                let myIcon = L.icon({iconUrl: 'images/icon-location.svg'});

                // Let marker match the coordinates from the IP Geolocation API
                L.marker([data.location.lat, data.location.lng], {icon: myIcon}).addTo(map);

                RESULTS_CONTAINER.classList.remove('loading');
            }
            else { // If IP address is invalid
                ERROR_MESSAGE.classList.add('show');
                IP_SEARCH_FIELD.setAttribute('aria-invalid', true);
                IP_SEARCH_FIELD.setAttribute('aria-describedby', 'error-message');
                ipIsInvalid = true;
            }
        });
};

// Run loadIPInfo on page load to show IP information of user
document.addEventListener('DOMContentLoaded', loadIPInfo);

// Run loadIPInfo when IP Search Button is clicked
IP_SEARCH_BTN.addEventListener('click', loadIPInfo);

// Remove values associated with IP error when user changes the value in the IP search field
IP_SEARCH_FIELD.addEventListener('input', () => {
    if (ipIsInvalid) {
        ERROR_MESSAGE.classList.remove('show');
        IP_SEARCH_FIELD.removeAttribute('aria-invalid');
        IP_SEARCH_FIELD.removeAttribute('aria-describedby');
        ipIsInvalid = false;
    }
});