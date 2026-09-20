// ── WMO weather code → emoji ──────────────────────────────────────────
export function getWeatherEmoji(code) {
  if (code === 0)              return '☀️';   // Clear sky
  if (code === 1)              return '🌤️';   // Mainly clear
  if (code === 2)              return '⛅';   // Partly cloudy
  if (code === 3)              return '☁️';   // Overcast
  if (code === 45 || code === 48) return '🌫️'; // Fog
  if (code >= 51 && code <= 55)  return '🌦️'; // Drizzle
  if (code >= 61 && code <= 67)  return '🌧️'; // Rain
  if (code >= 71 && code <= 77)  return '❄️';   // Snow
  if (code >= 80 && code <= 82)  return '🌦️'; // Rain showers
  if (code === 85 || code === 86) return '🌨️'; // Snow showers
  if (code === 95)             return '⛈️';   // Thunderstorm
  if (code === 96 || code === 99) return '⚡';   // Thunderstorm + hail
  return '🌤️'; // fallback
}

// ── WMO weather code → background gradient ───────────────────────────
export function getWeatherGradient(code) {
  if (code === 0 || code === 1)  return 'linear-gradient(160deg, #f59e0b, #ef7c1a)'; // sunny
  if (code === 2 || code === 3)  return 'linear-gradient(160deg, #7090a8, #4a6a82)'; // cloudy
  if (code === 45 || code === 48) return 'linear-gradient(160deg, #8a9aaa, #6a7a88)'; // fog
  if (code >= 51 && code <= 55)  return 'linear-gradient(160deg, #5a8a9b, #3a6a7e)'; // drizzle
  if (code >= 61 && code <= 67)  return 'linear-gradient(160deg, #4a7a9b, #2d5f7e)'; // rain
  if (code >= 71 && code <= 86)  return 'linear-gradient(160deg, #a0b4c8, #7090a8)'; // snow
  if (code >= 95)                return 'linear-gradient(160deg, #2d2d4e, #1a1a36)'; // thunder
  return 'linear-gradient(160deg, #2ea0be, #0e7c86)'; // default
}
