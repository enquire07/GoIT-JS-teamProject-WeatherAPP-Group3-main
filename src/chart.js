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
          weatherElement.classList.add('weather-element');
        const time = new Date(item.dt * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        const temperature = item.main.temp;
        const description = item.weather[0].description;
        const clouds = item.clouds.all;
        const windSpeed = item.wind.speed;
        const visibility = item.visibility / 1000; // Convert visibility to kilometers
        const iconUrl = `https://openweathermap.org/img/w/${item.weather[0].icon}.png`;

        weatherElement.innerHTML = `
           <div class="weather-time">${time}</div>
            <img class="weather-icon" src="${iconUrl}" alt="${description}">
            <div class="weather-temp">Temperature: ${temperature}${unitSymbol}</div>
            <div class="weather-desc">Description: ${description}</div>
            <div class="weather-clouds">Clouds: ${clouds}% <img class="icon" src="cloud-icon.png" alt="Clouds"></div>
            <div class="weather-wind">Wind Speed: ${windSpeed} m/s <img class="icon" src="wind-icon.png" alt="Wind"></div>
            <div class="weather-visibility">Visibility: ${visibility} km <img class="icon" src="visibility-icon.png" alt="Visibility"></div>
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
                    borderColor: 'orange',
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
                    borderColor: 'black',
                    fill: false
                },
                {
                    label: 'Pressure (hPa)',
                    data: pressures,
                    borderColor: 'green',
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Date'
                    }
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Value'
                    }
                }
            }
        }
    });
}

document.getElementById('showGraphBtn').addEventListener('click', function() {
    const chartElement = document.getElementById('weatherChart');
    chartElement.style.display = 'block';
});

/// Buttons /////


document.getElementById('fWeather').addEventListener('click', function(){
    document.getElementById('cWeather').style.display = 'none';
    document.getElementById('cDate').style.display = 'none';
    document.getElementById('fDWeather').style.display = 'block';
    
} )

document.getElementById('tWeather').addEventListener('click', function(){
    document.getElementById('cWeather').style.display = 'block';
    document.getElementById('cDate').style.display = 'block';
    document.getElementById('fDWeather').style.display = 'none';
} )

document.getElementById('showGraphBtn').addEventListener('click', function() {
    document.getElementById('fDChart').hidden = false;
    document.getElementById('weatherChart').style.display = 'block';
});

document.getElementById('hideGraphBtn').addEventListener('click', function() {
    document.getElementById('fDChart').hidden = true;
    document.getElementById('weatherChart').style.display = 'none';
});