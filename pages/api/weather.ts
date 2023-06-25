import type { NextApiRequest, NextApiResponse } from 'next'
import { getPeople } from './people';
import cache from '../../lib/in-memory-cache';

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

const defaultRawWeather: RawWeather = {
	app_temp: 75,
	aqi: 5,
	lat: 30,
	lon: 30,
	rh: 50,
	temp: 75,
	timezone: 'UTC',
	uv: 5,
	weather: {
		description: 'fine i guess (weather api is down)',
	},
};

const useDefaultWeather = !! process.env.DISABLE_API_FETCH;
const familyName = process.env.FAMILY_NAME || 'Family Member';
const hotHosts = (process.env.HOT_HOSTS || '').split( ',' );

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<WeatherReports>
) {
	res.status( 200 )
		.json( await getWeatherReports( req.headers.host || 'unknown' ) );
}

async function getRawWeather( location: string ): Promise<RawWeather> {
	if ( useDefaultWeather ) {
		console.log( `Skipping fetching weather for ${location}...` );
		return defaultRawWeather;
	}

	if ( cache.get( 'too_many_requests' ) ) {
		console.log( 'Backing off all API requests due to 429...' );
		return defaultRawWeather;
	}

	if ( cache.get( 'recent_error' ) ) {
		console.log( 'Backing off all API requests due to recent error...' );
		return defaultRawWeather;
	}

	const baseUrl = 'https://api.weatherbit.io/v2.0/current';
	const params = [
		`city=${encodeURIComponent(location)}`,
		`units=I`,
		`key=${process.env.WEATHERBIT_API_KEY}`,
	].join( '&' );

	const { data: [ weather ] } = await fetch( `${baseUrl}?${params}` )
		.then( ( response ) => {
			if ( response.ok ) {
				return response.json();
			}

			let backOff = 3600;
			let backOffCacheKey = 'recent_error';

			const retryAfter = parseInt( response.headers.get( 'x-ratelimit-reset' ) ?? '', 10 );
			if ( retryAfter ) {
				backOff = Math.round( retryAfter - Date.now() / 1000 );
				backOffCacheKey = 'too_many_requests';
			}

			cache.set( backOffCacheKey, true, backOff );
			console.log( `Error fetching weather for ${location}, received ${response.status}, will try again in ${backOff} seconds` );

			return {
				data: [ defaultRawWeather ],
			};
		} ).catch( () => {

		} );

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
	const reports: WeatherReport[] = [];

	for ( const person of people ) {
		const cacheKey = `WEATHER_${person.location}`;
		const fallback = () => getReportForPerson( person );
		reports.push( await cache.getWithFallback<WeatherReport>( cacheKey, fallback, 3600 ) );
	}

	return {
		familyName,
		defaultSortKey,
		reports,
	};
}
