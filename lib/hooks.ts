import { useEffect, useState } from "react";
import { sortBy } from "sort-by-typescript";

function getReports(): Promise<WeatherReports> {
  return fetch("/api/weather").then((response) => response.json());
}

export function useAutoUpdatingWeather(
  ssrReports: WeatherReport[],
  sortKey: string
) {
  const [reports, setReports] = useState<WeatherReport[]>(ssrReports);

  useEffect(() => {
    function update(): void {
      getReports().then(({ reports }) => setReports(reports));
    }

    const timer = setInterval(update, (60 * 5 + 1) * 1000);

    return () => clearInterval(timer);
  }, []);

  return reports.sort(sortBy(sortKey));
}

export function usePeople(): Person[] {
  const [people, updatePeople] = useState<Person[]>([]);

  useEffect(() => {
    fetch("/api/people")
      .then((response) => response.json())
      .then(updatePeople);
  }, []);

  return people;
}
