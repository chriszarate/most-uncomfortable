import { cacheAndRateLimit, ONE_HOUR_IN_SECONDS } from "./rate-limit";
import { getLocalTime } from "./utils";

const BASE_URL = "https://api.weather.com/v2/pws/observations/current";
const DAILY_API_REQUEST_LIMIT = 500;
const HOURLY_API_REQUEST_LIMIT = Math.floor(DAILY_API_REQUEST_LIMIT / 24);

interface WeatherComData {
  epoch: number;
  humidity: number;
  imperial: {
    dewpt: number;
    elev: number;
    heatIndex: number;
    precipRate: number;
    precipTotal: number;
    pressure: number;
    temp: number;
    windChill: number;
    windGuest: number;
    windSpeed: number;
  };
  lat: number;
  lon: number;
  obsTimeLocal: string;
  qcStatus: number;
  solarRadiation: number;
  uv: number;
  winddir: number;
}

const defaultWeatherComData: WeatherComData = {
  epoch: 0,
  humidity: 50,
  imperial: {
    dewpt: 50,
    elev: 0,
    heatIndex: 75,
    precipRate: 0,
    precipTotal: 0,
    pressure: 0,
    temp: 75,
    windChill: 75,
    windGuest: 0,
    windSpeed: 0,
  },
  lat: 30,
  lon: 30,
  obsTimeLocal: getLocalTime("America/New_York"),
  qcStatus: 0,
  solarRadiation: 0,
  uv: 5,
  winddir: 0,
};

async function getWeatherComData(stationId: string): Promise<WeatherComData> {
  const params = [
    `apiKey=${process.env.WEATHER_COM_API_KEY}`,
    "format=json",
    `stationId=${encodeURIComponent(stationId)}`,
    "units=e",
  ].join("&");

  const url = `${BASE_URL}?${params}`;
  const response = await fetch(url).catch(() => null);

  if (!response || !response.ok) {
    throw new Error("Failed to fetch weather data");
  }

  const {
    observations: [weather],
  } = await response.json();

  return weather;
}

const cachedGetWeatherComData = cacheAndRateLimit({
  cacheKeyPrefix: "weather_com",
  defaultTTL: ONE_HOUR_IN_SECONDS,
  defaultValue: defaultWeatherComData,
  fn: getWeatherComData,
  maxInWindow: HOURLY_API_REQUEST_LIMIT,
  windowInSeconds: 3600,
});

export async function getWeather(
  person: Person,
  backupReport: WeatherReport
): Promise<WeatherReport> {
  const { status, value: weather } = await cachedGetWeatherComData(
    person.stationId ?? ""
  );

  const {
    humidity,
    imperial: { heatIndex: feelsLike, temp },
    lat,
    lon: long,
    uv,
  } = weather;

  const latlong = `${lat},${long}`;

  const { aqi, currentCondition, localTime } = backupReport;

  return {
    ...person,
    aqi,
    coords: {
      lat,
      long,
    },
    currentCondition,
    feelsLike,
    humidity,
    links: {
      location: `https://www.google.com/maps/@${latlong},12z`,
      weather: `https://www.wunderground.com/dashboard/pws/${
        person.stationId ?? ""
      }`,
    },
    localTime,
    source: "weather-station",
    status,
    temp,
    uv,
  };
}
