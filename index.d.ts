declare module "sheetrock";

type Person = {
  location: string;
  name: string;
  shortLocation: string;
};

type WeatherData = {
  aqi: number;
  coords: {
    lat: number;
    long: number;
  };
  currentCondition: string;
  feelsLike: number;
  humidity: number;
  links: {
    location: string;
    weather: string;
  };
  localTime: string;
  temp: number;
  uv: number;
};

type WeatherReport = Person & WeatherData;

type WeatherReports = {
  defaultSortKey: string;
  error: WeatherError | null;
  familyName: string;
  reports: WeatherReport[];
  status: "cached" | "fetched";
  ttl: number;
};

type WeatherError = {
  backOff: number;
  datestring: string;
  location: string;
  status: number;
  timestamp: number;
};
