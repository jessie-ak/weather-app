function getLocationWeather() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        fetchWeather({ lat, lon });
      },
      (error) => {
        document.getElementById("weatherResult").innerHTML = `
            <div class="alert alert-danger">Error: ${error.message}</div>
          `;
      }
    );
  } else {
    document.getElementById("weatherResult").innerHTML = `
        <div class="alert alert-danger">Geolocation is not supported by this browser.</div>
      `;
  }
}

function getCityWeather() {
  const city = document.getElementById("city").value.trim();
  if (city) {
    fetchWeather({ city });
  } else {
    document.getElementById("weatherResult").innerHTML = `
        <div class="alert alert-warning">Please enter a city name</div>
      `;
  }
}

function fetchWeather(params) {
  const query = new URLSearchParams(params).toString();
  document.getElementById("weatherResult").innerHTML = `
      <div class="text-center">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
    `;

  fetch(`/weather?${query}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        throw new Error(data.error);
      }
      displayWeather(data);
    })
    .catch((error) => {
      document.getElementById("weatherResult").innerHTML = `
          <div class="alert alert-danger">${
            error.message || "Failed to fetch weather data"
          }</div>
        `;
    });
}

function displayWeather(data) {
    const aqiText = ['Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'][data.aqi - 1] || 'Unknown';
    const aqiClass = ['bg-success', 'bg-info', 'bg-warning', 'bg-danger', 'bg-dark'][data.aqi - 1] || 'bg-secondary';
    
    const weatherIcon = getWeatherIcon(data.description);
    const forecastHtml = data.forecast.map(day => `
      <div class="col">
        <div class="card h-100">
          <div class="card-body text-center p-2">
            <h6 class="card-title mb-1">${new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}</h6>
            <div class="fs-3">${getWeatherIcon(day.description)}</div>
            <div class="fs-6">${Math.round(day.temp)}°C</div>
            <small class="text-muted d-block text-truncate">${day.description}</small>
          </div>
        </div>
      </div>
    `).join('');
  
    // Add country to the city display
    const locationName = data.country ? `${data.city}, ${data.country}` : data.city;
  
    document.getElementById('weatherResult').innerHTML = `
      <div class="current-weather mb-3">
        <h2 class="mb-2">${locationName}</h2>
        <div class="d-flex align-items-center justify-content-between mb-2">
          <div class="display-1">${weatherIcon}</div>
          <div>
            <div class="display-2">${Math.round(data.temp)}°C</div>
            <div class="text-capitalize">${data.description}</div>
          </div>
        </div>
        <div class="row g-2">
          <!-- Rest of your weather display code remains the same -->
          ${forecastHtml}
        </div>
      </div>
    `;
  }
function getWeatherIcon(description) {
  const desc = description.toLowerCase();
  if (desc.includes("sun") || desc.includes("clear")) return "☀️";
  if (desc.includes("cloud")) return "☁️";
  if (desc.includes("rain")) return "🌧️";
  if (desc.includes("snow")) return "❄️";
  if (desc.includes("thunder") || desc.includes("storm")) return "⛈️";
  if (desc.includes("fog") || desc.includes("mist")) return "🌫️";
  return "🌤️";
}
