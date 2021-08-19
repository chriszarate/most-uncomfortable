declare module 'sheetrock';

type Person = {
	location: string,
	name: string,
	shortLocation: string,
};

type StoredPerson = Omit<Person, 'shortLocation'>[];

type WeatherReport = Person & {
	aqi: number,
	coords: {
		lat: number,
		long: number,
	},
	currentCondition: string,
	feelsLike: number,
	humidity: number,
	links: {
		location: string,
		weather: string,
	},
	localTime: string,
	temp: number,
	uv: number,
};
