import type { NextApiRequest, NextApiResponse } from 'next'
import { getPeople } from './people';
import { notEmpty } from '../../lib/utils';
import InMemoryCache from '../../lib/in-memory-cache';

const cache = new InMemoryCache( true );

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

	cache.set( location, weather, 3000 );

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
			description,
		},
	} = await getRawWeather( person.location );

	const latlong = `${lat},${long}`;
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
		currentCondition: description.toLowerCase(),
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
