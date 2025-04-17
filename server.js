// Add this helper function at the top of server.js
function getCountryName(countryCode) {
    const countryNames = {
      'US': 'USA',
      'GB': 'UK',
      'IN': 'India',
      // Add more country mappings as needed
    };
    return countryNames[countryCode] || countryCode;
  }
  
  // Then modify the response to use it:
  res.json({
    city: current.name,
    country: getCountryName(current.sys.country), // Use the helper function
    // rest of the properties...
  });
const express = require('express');
const axios = require('axios');
require('dotenv').config();
const app = express();

app.use(express.static('public'));

app.get('/weather', async (req, res) => {
  const { lat, lon, city } = req.query;
  const API_KEY = process.env.WEATHER_API;

  try {
    let geoData;

    if (city) {
      // Convert city to coordinates
      const cityRes = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}`);
      geoData = cityRes.data.coord;
    } else if (lat && lon) {
      geoData = { lat, lon };
    } else {
      return res.status(400).json({ error: 'No location data provided' });
    }

    const [weatherRes, forecastRes, airRes] = await Promise.all([
      axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${geoData.lat}&lon=${geoData.lon}&appid=${API_KEY}&units=metric`),
      axios.get(`https://api.openweathermap.org/data/2.5/forecast?lat=${geoData.lat}&lon=${geoData.lon}&appid=${API_KEY}&units=metric`),
      axios.get(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${geoData.lat}&lon=${geoData.lon}&appid=${API_KEY}`)
    ]);

    const current = weatherRes.data;
    const forecast = forecastRes.data.list.filter((_, i) => i % 8 === 0).slice(0, 5);
    const air = airRes.data.list[0];

    // Inside your /weather endpoint
res.json({
    city: current.name,
    country: current.sys.country, // Add this line
    temp: current.main.temp,
    description: current.weather[0].description,
    humidity: current.main.humidity,
    precipitation: current.rain?.["1h"] || 0,
    wind: current.wind.speed,
    aqi: air.main.aqi,
    forecast: forecast.map(day => ({
      date: day.dt_txt.split(' ')[0],
      temp: day.main.temp,
      description: day.weather[0].description,
      humidity: day.main.humidity,
      precipitation: day.rain?.["3h"] || 0
    }))
  });
  } catch (error) {
    console.error(error);
    res.json({ error: 'Failed to fetch weather data' });
  }
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
