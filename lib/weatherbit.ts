import {
  cacheAndRateLimit,
  RateLimitError,
  ONE_HOUR_IN_SECONDS,
} from "./rate-limit";
import { getLocalTime } from "./utils";

const BASE_URL = "https://api.weatherbit.io/v2.0/current";
const DAILY_API_REQUEST_LIMIT = 50;
const HOURLY_API_REQUEST_LIMIT = Math.floor(DAILY_API_REQUEST_LIMIT / 24);

interface WeatherBitData {
  app_temp: number;
  aqi: number;
  lat: number;
  lon: number;
  rh: number;
  temp: number;
  timezone: string;
  uv: number;
  weather: {
    description: string;
  };
}

const defaultWeatherBitData: WeatherBitData = {
  app_temp: 75,
  aqi: 5,
  lat: 30,
  lon: 30,
  rh: 50,
  temp: 75,
  timezone: "UTC",
  uv: 5,
  weather: {
    description: "fine i guess (weather api is down)",
  },
};

async function getWeatherBitData(location: string): Promise<WeatherBitData> {
  const params = [
    `city=${encodeURIComponent(location)}`,
    `units=I`,
    `key=${process.env.WEATHERBIT_API_KEY}`,
  ].join("&");

  const url = `${BASE_URL}?${params}`;
  const response = await fetch(url).catch(() => null);

  if (!response || !response.ok) {
    const backOff = response
      ? Math.round(
          parseInt(response.headers.get("x-ratelimit-reset") ?? "", 10) -
            Date.now() / 1000
        )
      : 1800;

    throw new RateLimitError("Rate limit hit for Weatherbit", backOff);
  }

  const {
    data: [weather],
  } = await response.json();

  return weather;
}

const cachedGetWeatherBitData = cacheAndRateLimit({
  cacheKeyPrefix: "weatherbit",
  defaultTTL: ONE_HOUR_IN_SECONDS,
  defaultValue: defaultWeatherBitData,
  fn: getWeatherBitData,
  maxInWindow: HOURLY_API_REQUEST_LIMIT,
  windowInSeconds: 3600,
});

export async function getWeather(person: Person): Promise<WeatherReport> {
  const { status, value: weather } = await cachedGetWeatherBitData(
    person.location
  );

  const {
    app_temp: feelsLike,
    aqi,
    lat,
    lon: long,
    rh: humidity,
    temp,
    timezone: timeZone,
    uv,
    weather: { description },
  } = weather;

  const latlong = `${lat},${long}`;
  const [city, state] = person.location.split(", ");

  return {
    ...person,
    aqi,
    coords: {
      lat,
      long,
    },
    currentCondition: description.toLowerCase(),
    feelsLike,
    humidity,
    links: {
      location: `https://www.google.com/maps/@${latlong},12z`,
      weather: `https://www.wunderground.com/weather/us/${state.toLowerCase()}/${city
        .toLowerCase()
        .replace(/ /g, "-")}/${lat},${long}`,
    },
    localTime: getLocalTime(timeZone),
    source: "weatherbit",
    status,
    temp,
    uv,
  };
}
