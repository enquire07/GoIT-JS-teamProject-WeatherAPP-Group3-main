const quotes = [
    { text: "So divinely is the world organized that every one of us, in our place and time, is in balance with everything else.", author: "Johann Wolfgang Von Goethe" },
    { text: "Life isn't about finding yourself. Life is about creating yourself.", author: "George Bernard Shaw" },
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { text: "The best way to predict the future is to create it.", author: "Peter Drucker" },
    { text: "You miss 100% of the shots you don’t take.", author: "Wayne Gretzky" },
    { text: "Do not watch the clock. Do what it does. Keep going.", author: "Sam Levenson" },
    { text: "Success is not the key to happiness. Happiness is the key to success.", author: "Albert Schweitzer" },
    // Add more quotes as needed
];


function getRandomQuote() {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    return quotes[randomIndex];
}


function displayRandomQuote() {
    const quote = getRandomQuote();
    const quoteTextElement = document.querySelector('.quote-text');
    const quoteAuthorElement = document.querySelector('.quote-author');

    quoteTextElement.textContent = quote.text;
    quoteAuthorElement.textContent = `- ${quote.author}`;
}


document.addEventListener('DOMContentLoaded', displayRandomQuote);

document.getElementById('searchForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const city = document.getElementById('cityInput').value;
    fetchWeather(city);
});

document.querySelectorAll('input[name="unit"]').forEach(radio => {
    radio.addEventListener('change', function() {
        const city = document.getElementById('cityInput').value;
        if (city) {
            fetchWeather(city);
        }
    });
});

function getSelectedUnit() {
    return document.querySelector('input[name="unit"]:checked').value;
}

function fetchWeather(city) {
    const unit = getSelectedUnit();
    const apiKey = 'f1a7f601f87c9d97579ef8237cc83ff1';
    const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=${unit}`;

    fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
        const forecast = data.list.reduce((acc, item) => {
            const date = item.dt_txt.split(' ')[0];
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(item);
            return acc;
        }, {});

        displayForecast(forecast);
        prepareChartData(forecast);
        displayRandomQuote(); // Call this function to change the quote
    })
    .catch(error => {
        console.error('Error fetching data:', error);
    });
}

function displayForecast(forecast) {
    const forecastContainer = document.getElementById('forecast');
    const unit = getSelectedUnit();
    const unitSymbol = unit === 'metric' ? '°C' : '°F';
    forecastContainer.innerHTML = '';

    for (const date in forecast) {
        const dayForecast = forecast[date];
        const minTemp = Math.min(...dayForecast.map(item => item.main.temp_min));
        const maxTemp = Math.max(...dayForecast.map(item => item.main.temp_max));
        const dayElement = document.createElement('div');
        dayElement.classList.add('day');
        const iconUrl = `https://openweathermap.org/img/w/${dayForecast[0].weather[0].icon}.png`;
        dayElement.innerHTML = `
            <div>${new Date(dayForecast[0].dt * 1000).toDateString()}</div>
            <img src="${iconUrl}" alt="${dayForecast[0].weather[0].description}">
            <div>Min Temp: ${minTemp}${unitSymbol}</div>
            <div>Max Temp: ${maxTemp}${unitSymbol}</div>
        `;
        dayElement.addEventListener('click', function() {
            displayWeatherInfo(dayForecast);
        });
        forecastContainer.appendChild(dayElement);
    }
}

function displayWeatherInfo(weatherData) {
    const weatherInfoContainer = document.getElementById('weatherInfo');
    const unit = getSelectedUnit();
    const unitSymbol = unit === 'metric' ? '°C' : '°F';
    weatherInfoContainer.innerHTML = '';

    weatherData.forEach(item => {
        const weatherElement = document.createElement('div');
        const time = new Date(item.dt * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        const temperature = item.main.temp;
        const description = item.weather[0].description;
        const clouds = item.clouds.all;
        const windSpeed = item.wind.speed;
        const visibility = item.visibility / 1000; // Convert visibility to kilometers
        const iconUrl = `https://openweathermap.org/img/w/${item.weather[0].icon}.png`;

        weatherElement.innerHTML = `
            <div>${time}</div>
            <img src="${iconUrl}" alt="${description}">
            <div>Temperature: ${temperature}${unitSymbol}</div>
            <div>Description: ${description}</div>
            <div>Clouds: ${clouds}% <img src="cloud-icon.png" alt="Clouds"></div>
            <div>Wind Speed: ${windSpeed} m/s <img src="wind-icon.png" alt="Wind"></div>
            <div>Visibility: ${visibility} km <img src="visibility-icon.png" alt="Visibility"></div>
        `;
        weatherInfoContainer.appendChild(weatherElement);
    });

    weatherInfoContainer.classList.remove('hide');
}

function prepareChartData(forecast) {
    const labels = Object.keys(forecast);
    const temperatures = [];
    const humidities = [];
    const windSpeeds = [];
    const pressures = [];

    for (const date in forecast) {
        const dayForecast = forecast[date];
        const avgTemp = dayForecast.reduce((sum, item) => sum + item.main.temp, 0) / dayForecast.length;
        const avgHumidity = dayForecast.reduce((sum, item) => sum + item.main.humidity, 0) / dayForecast.length;
        const avgWindSpeed = dayForecast.reduce((sum, item) => sum + item.wind.speed, 0) / dayForecast.length;
        const avgPressure = dayForecast.reduce((sum, item) => sum + item.main.pressure, 0) / dayForecast.length;
        
        temperatures.push(avgTemp);
        humidities.push(avgHumidity);
        windSpeeds.push(avgWindSpeed);
        pressures.push(avgPressure);
    }

    displayChart(labels, temperatures, humidities, windSpeeds, pressures);
}

function displayChart(labels, temperatures, humidities, windSpeeds, pressures) {
    const ctx = document.getElementById('weatherChart').getContext('2d');
    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Temperature (°C)',
                    data: temperatures,
                    borderColor: 'red',
                    fill: false
                },
                {
                    label: 'Humidity (%)',
                    data: humidities,
                    borderColor: 'blue',
                    fill: false
                },
                {
                    label: 'Wind Speed (m/s)',
                    data: windSpeeds,
                    borderColor: 'green',
                    fill: false
                },
                {
                    label: 'Pressure (hPa)',
                    data: pressures,
                    borderColor: 'purple',
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    document.getElementById('weatherChart').style.display = 'block';
}