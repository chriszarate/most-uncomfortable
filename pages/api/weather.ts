import type { NextApiRequest, NextApiResponse } from 'next'
import { getPeople, Person } from './people';
import { notEmpty } from '../../lib/utils';
import InMemoryCache from '../../lib/in-memory-cache';

const cache = new InMemoryCache( true );

export type WeatherReport = Person & {
	aqi: number,
	coords: {
		lat: number,
		long: number,
	},
	currentCondition: string,
	feelsLike?: number,
	humidity: number,
	links: {
		location: string,
		weather: string,
	},
	localTime: string,
	temp: number,
	uv: number,
};

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse<WeatherReport[]>
) {
	res.status( 200 )
		.json( await getWeatherReports() );
}

async function getRawWeather( location: string ) {
	const cached = cache.get( location );

	if ( cached ) {
		return cached;
	}

	const baseUrl = 'https://api.weatherbit.io/v2.0/current';
	const params = [
		`city=${location}`,
		`units=I`,
		`key=${process.env.WEATHERBIT_API_KEY}`,
	].join( '&' );

	const { data: [ weather ] } = await fetch( `${baseUrl}?${params}` ).then( response => response.json() );

	cache.set( location, weather, 30 );

	return weather;
}

async function getReportForPerson( person: Person ): Promise<WeatherReport | null> {
	if ( ! person.name || ! person.location ) {
		return null;
	}

	const {
		app_temp: feelsLike,
		aqi,
		lat,
		lon: long,
		rh: humidity,
		temp,
		timezone: timeZone,
		uv,
		weather: {
			code,
			description,
		},
	} = await getRawWeather( person.location );

	let joiner = 'with';
	if ( code < 130 ) {
		joiner = 'and';
	}

	const latlong = `${lat},${long}`;
	const condition = description.toLowerCase();
	const localTime = new Date()
		.toLocaleTimeString( 'en-US', { timeZone } )
		.replace( /^(\d+:\d+):\d+ ([A-z]+)/, '$1$2' )
		.toLowerCase();

	return {
		...person,
		aqi,
		coords: {
			lat,
			long,
		},
		currentCondition: `${temp}° ${joiner} ${condition}`,
		feelsLike,
		humidity,
		links: {
			location: `https://www.google.com/maps/@${latlong},12z`,
			weather: `https://darksky.net/forecast/${latlong}/us12/en`,
		},
		localTime,
		temp,
		uv,
	};
}

export async function getWeatherReports(): Promise<WeatherReport[]> {
	const people = await getPeople();
	const reports = await Promise.all( people.map( getReportForPerson ) );

	return reports.filter( notEmpty );
}
