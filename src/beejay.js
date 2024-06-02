//  UNSPLASH_ACCESS_KEY = '77yWELf5lOKLk00J-OCAB_2vDLo2jvZE5EoIjhyorUU';


const UNSPLASH_ACCESS_KEY = '77yWELf5lOKLk00J-OCAB_2vDLo2jvZE5EoIjhyorUU';

function fetchCityImage(city) {
    const apiUrl = `https://api.unsplash.com/photos/random?query=${encodeURIComponent(city)}&client_id=${UNSPLASH_ACCESS_KEY}`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.urls && data.urls.full) {
                document.body.style.backgroundImage = `url(${data.urls.full})`;
                document.body.style.backgroundSize = 'cover';
                document.body.style.backgroundPosition = 'center';
            } else {
                console.log('No images found for the specified city.');
            }
        })
        .catch(error => {
            console.error('Error fetching image from Unplash:', error);
        });
}
document.getElementById('searchForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const city = document.getElementById('cityInput').value;
    fetchWeather(city);
 fetchCityImage(city);
});

document.querySelectorAll('input[name="unit"]').forEach(radio => {
    radio.addEventListener('change', function() {
        const city = document.getElementById('cityInput').value;
        if (city) {
            fetchWeather(city);
             fetchCityImage(city);
        }
    });
});


