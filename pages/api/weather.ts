import type { NextApiRequest, NextApiResponse } from 'next'
import { getPeople } from './people';
import cache from '../../lib/in-memory-cache';

const familyName = process.env.FAMILY_NAME || 'Family Member';
const hotHosts = (process.env.HOT_HOSTS || '').split( ',' );

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<WeatherReports>
) {
	res.status( 200 )
		.json( await getWeatherReports( req.headers.host ) );
}

async function getRawWeather( location: string ) {
	const baseUrl = 'https://api.weatherbit.io/v2.0/current';
	const params = [
		`city=${location}`,
		`units=I`,
		`key=${process.env.WEATHERBIT_API_KEY}`,
	].join( '&' );

	const { data: [ weather ] } = await fetch( `${baseUrl}?${params}` ).then( response => response.json() );

	return weather;
}

async function getReportForPerson( person: Person ): Promise<WeatherReport> {
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

export async function getWeatherReports( hostname: string ): Promise<WeatherReports> {
	const defaultSortKey = hotHosts.includes( hostname ) ? '-temp' : 'temp';
	const people = await getPeople();
	const reports = await Promise.all(
		people.map( person => {
			const cacheKey = `WEATHER_${person.location}`;
			const fallback = () => getReportForPerson( person );
			return cache.getWithFallback<WeatherReport>( cacheKey, fallback, 300 );
		} )
	);

	return {
		familyName,
		defaultSortKey,
		reports,
	};
}
