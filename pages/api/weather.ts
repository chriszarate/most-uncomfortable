import type { NextApiRequest, NextApiResponse } from "next";
import { getPeople } from "./people";
import { kv } from "@vercel/kv";

type RawWeather = {
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
};

const KV_RECENT_ERROR_KEY = "recent_error";
const KV_WEATHER_REPORTS_KEY = "all_weather_reports";

const defaultRawWeather: RawWeather = {
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

const familyName = process.env.FAMILY_NAME || "Family Member";
const hotHosts = (process.env.HOT_HOSTS || "").split(",");

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<WeatherReports>
) {
  res.status(200).json(await getWeatherReports(req.headers.host || "unknown"));
}

async function getRawWeather(location: string): Promise<RawWeather> {
  const baseUrl = "https://api.weatherbit.io/v2.0/current";
  const params = [
    `city=${encodeURIComponent(location)}`,
    `units=I`,
    `key=${process.env.WEATHERBIT_API_KEY}`,
  ].join("&");

  console.log(`${baseUrl}?${params}`);
  const response = await fetch(`${baseUrl}?${params}`).catch(() => null);

  if (!response || !response.ok) {
    const backOff = response
      ? Math.round(
          parseInt(response.headers.get("x-ratelimit-reset") ?? "", 10) -
            Date.now() / 1000
        )
      : 1800;
    const status = response ? response.status : 599;

    const error: WeatherError = {
      backOff,
      datestring: new Date().toISOString(),
      location,
      status,
      timestamp: Date.now() / 1000,
    };

    await kv.set<WeatherError>(KV_RECENT_ERROR_KEY, error, { px: backOff });

    throw new Error(
      `Error fetching weather for ${location}, received ${status}, will try again in ${backOff} seconds`
    );
  }

  const {
    data: [weather],
  } = await response.json();

  return weather;
}

function getLocalTime(timeZone: string): string {
  return new Date()
    .toLocaleTimeString("en-US", { timeZone })
    .replace(/^(\d+:\d+):\d+ ([A-z]+)/, "$1$2")
    .toLowerCase();
}

function getReportForPerson(person: Person, data: RawWeather): WeatherReport {
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
  } = data;

  const latlong = `${lat},${long}`;

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
      weather: `https://darksky.net/forecast/${latlong}/us12/en`,
    },
    localTime: getLocalTime(timeZone),
    temp,
    uv,
  };
}

async function getWeatherReportsForPeople(
  people: Person[]
): Promise<WeatherReport[]> {
  const reports: WeatherReport[] = [];

  for (const person of people) {
    const data = await getRawWeather(person.location).catch(
      () => defaultRawWeather
    );
    const report: WeatherReport = getReportForPerson(person, data);
    reports.push(report);

    // dont slam
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  return reports;
}

export async function getWeatherReports(
  hostname: string
): Promise<WeatherReports> {
  const cachedReports = await kv.get<WeatherReports>(KV_WEATHER_REPORTS_KEY);
  const recentError = await kv.get<WeatherError>(KV_RECENT_ERROR_KEY);

  if (cachedReports) {
    return {
      ...cachedReports,
      error: recentError || null,
      status: recentError ? "error" : "cached",
    };
  }

  const defaultSortKey = hotHosts.includes(hostname) ? "-temp" : "temp";
  const people = await getPeople();

  const reports: WeatherReports = {
    defaultSortKey,
    error: null,
    familyName,
    reports: await getWeatherReportsForPeople(people),
    status: "fetched",
  };

  await kv.set<WeatherReports>(KV_WEATHER_REPORTS_KEY, reports, { ex: 3600 });

  return reports;
}
