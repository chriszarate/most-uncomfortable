import type { NextApiRequest, NextApiResponse } from "next";

import { getPeople } from "./people";
import { getWeather } from "../../lib/weatherbit";
import { getWeather as getWeatherCom } from "../../lib/weather-com";

const familyName = process.env.FAMILY_NAME || "Family Member";
const hotHosts = (process.env.HOT_HOSTS || "").split(",");

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<WeatherReports>
) {
  res.status(200).json(await getWeatherReports(req.headers.host || "unknown"));
}

async function getWeatherReportsForPeople(
  people: Person[]
): Promise<WeatherReport[]> {
  const reports: WeatherReport[] = [];

  for (const person of people) {
    let report: WeatherReport = await getWeather(person);

    if (person.stationId) {
      report = await getWeatherCom(person, report);
    }

    reports.push(report);
  }

  return reports;
}

export async function getWeatherReports(
  hostname: string
): Promise<WeatherReports> {
  const defaultSortKey = hotHosts.includes(hostname) ? "-temp" : "temp";
  const people = await getPeople();

  return {
    defaultSortKey,
    error: null,
    familyName,
    reports: await getWeatherReportsForPeople(people),
  };
}
