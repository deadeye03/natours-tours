document.addEventListener('DOMContentLoaded', () => {
    let locations = JSON.parse(document.getElementById('map').getAttribute('data-location'));
    console.log(locations)
    
    mapboxgl.accessToken = 'pk.eyJ1Ijoic2F1cmFiaDc1MjAiLCJhIjoiY2x5Nnp0ZDhsMDBsODJpcXc1ZWUyMzdrYyJ9.4M-Xv-WAlHoTX02fwrTmvw';
    let map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11'
    });
    
})