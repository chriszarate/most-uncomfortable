declare module 'sheetrock';

type Person = {
	emoji: string,
	location: string,
	name: string,
	shortLocation: string,
};

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
