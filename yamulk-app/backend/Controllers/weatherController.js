import Destination from "../Models/destinationModel.js";

export async function getWeather(req, res) {
  try {
    const { destinationId } = req.params;

    // 1. Get destination details from your database
    const destination = await Destination.findById(destinationId);

    if (!destination) {
      return res.status(404).json({
        message: "Destination not found",
      });
    }
    // get latitude and longitude
    const geocodingData = await getLatitudeLongitude(destination)
    const location = geocodingData.results?.[0];

    if (!location) {
      return res.status(404).json({
        message: "Location coordinates not found",
      });
    }

    //get weather data
    const weatherUrl =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${location.latitude}` +
      `&longitude=${location.longitude}` +
      `&current=temperature_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m` +
      `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max` +
      `&timezone=Asia%2FColombo`;

    const weatherResponse = await fetch(weatherUrl);

    if (!weatherResponse.ok) {
      throw new Error("Weather service request failed");
    }

    const weather = await weatherResponse.json();

    return res.status(200).json({
        destination: {
            id: destination._id,
            name: destination.name,
            location: destination.location,
        },

        coordinates: {
            latitude: location.latitude,
            longitude: location.longitude,
        },

        currentWeather: {
            time: weather.current.time,
            temperature: weather.current.temperature_2m,
            feelsLike: weather.current.apparent_temperature,
            precipitation: weather.current.precipitation,
            windSpeed: weather.current.wind_speed_10m,
            weatherCode: weather.current.weather_code,
        },

        forecast: weather.daily.time.map((date, index) => ({
            date,
            weatherCode: weather.daily.weather_code[index],
            weather: getWeatherLabel(weather.daily.weather_code[index]),
            maxTemperature: weather.daily.temperature_2m_max[index],
            minTemperature: weather.daily.temperature_2m_min[index],
            rainProbability: weather.daily.precipitation_probability_max[index],
        })),
        });

  } catch (error) {
    console.error("Destination weather error:", error);

    return res.status(500).json({
      message: "Could not get destination weather",
      error: error.message,
    });
  }
}

async function getLatitudeLongitude(destination){
    try {
        // Add Sri Lanka to reduce wrong matches
        const placeName = destination.location.split(",")[0].trim();

        // Convert place name to latitude / longitude
        const geocodingUrl =
          `https://geocoding-api.open-meteo.com/v1/search` +
          `?name=${encodeURIComponent(placeName)}` +
          `&count=1` +
          `&language=en` +
          `&countryCode=LK`;

        const geocodingResponse = await fetch(geocodingUrl);

        if (geocodingResponse.ok) {
            const geocodingData = await geocodingResponse.json();
            if (geocodingData.results && geocodingData.results.length > 0) {
                return geocodingData;
            }
        }
    } catch (error) {
        console.error("Geocoding service error:", error);
    }

    // Fallback to Colombo coordinates if location not found or API fails
    return {
        results: [{
            latitude: 6.9271,
            longitude: 79.8612,
            name: "Colombo (Fallback)"
        }]
    };
}

function getWeatherLabel(code) {
  const weatherCodes = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Heavy drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    71: "Light snow",
    73: "Moderate snow",
    75: "Heavy snow",
    80: "Rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    95: "Thunderstorm",
  };

  return weatherCodes[code] || "Unknown";
}