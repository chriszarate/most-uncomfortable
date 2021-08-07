import { useEffect, useState } from 'react';
import sheetrock from 'sheetrock';
import sortBy from 'sort-by';
import config from './config';

const aqiApiKey = 'b9381ee3-fc6e-447a-8d5c-20531fdce8ce';
const aqiEndpoint = 'https://api.airvisual.com/v2/nearest_city';

function getAqi( lat, long ) {
	if ( ! lat || ! long ) {
		return null;
	}
	
	return fetch( `${aqiEndpoint}?lat=${lat}&lon=${long}&key=${aqiApiKey}` )
		.then( response => response.json() )
		.then( data => data.data.current.pollution.aqius );
}

function getPeople() {
	return new Promise( ( resolve, reject ) => {
		sheetrock( {
			url: config.sheetUrl,
			reset: true,
			query: 'select A,B,C,D',
			callback: function ( error, _, response ) {
				if ( error ) {
					reject( error );
				}

				resolve(
					response.rows
						.slice( 1 )
						.map( row => row.cellsArray )
				);
			}
		} );
	} );
}

function padNum( num ) {
	return num < 10 ? `0${num}` : num;
}

function getSummary( weather, location ) {
	const now = new Date();
	const utcDayString = `${now.getUTCFullYear()}/${padNum( now.getUTCMonth() + 1 )}/${padNum( now.getUTCDate() )}`;

	const {
		current_condition: [ current ],
		nearest_area: [ area ],
	} = weather;

	const utcObsTime = new Date( `${utcDayString} ${current.observation_time}` );
	const localObsTime = new Date( current.localObsDateTime.replace( /-/g, '/' ) );
	const offset = localObsTime - utcObsTime;
	const localTimeCalc = new Date( Date.now() + offset );

	let hour = localTimeCalc.getUTCHours();
	let meridien = 'am';
	if ( 0 === hour ) {
		hour = 12;
	} else if ( hour >= 12 ) {
		meridien = 'pm';
	}

	if ( hour > 12 ) {
		hour = hour - 12;
	}

	const localTime = `${hour}:${padNum(localTimeCalc.getUTCMinutes())}${meridien}`;

	let feelsLike = '';
	if ( Math.abs( current.FeelsLikeF - current.temp_F ) > 5 ) {
		feelsLike = `${current.FeelsLikeF}°`;
	}

	let joiner = 'with';
	if ( current.weatherCode < 130 ) {
		joiner = 'and';
	}

	const latlong = `${area.latitude},${area.longitude}`;
	const condition = current.weatherDesc[0].value.toLowerCase().replace( /shower$/, 'showers' );

	return {
		feelsLike,
		lat: area.latitude,
		localTime,
		locationLink: `https://www.google.com/maps/@${latlong},12z`,
		long: area.longitude,
		shortLocation: location.replace( /,\s[A-Z]{2}$/, '' ),
		temp: current.temp_F,
		weather: `${current.temp_F}° ${joiner} ${condition}`,
		weatherLink: `https://darksky.net/forecast/${latlong}/us12/en`,
		uv: current.uvIndex,
	};
}

function getWeather( location ) {
	if ( ! location ) {
		return null;
	}

	return fetch( `https://wttr.in/${encodeURIComponent( location )}?format=j1` )
		.then( response => response.json() );
}

function getPeopleAndWeather() {
	console.log( 'updating...' );
	return getPeople()
		.then( people => Promise.all(
			people.map( ( [ name, location, _, emoji ] ) => {
				if ( ! name || ! location ) {
					return {};
				}

				return getWeather( location )
					.then( weather => ( {
						...getSummary( weather, location ),
						emoji,
						name,
						location,
					} ) );
			} )
		) )
		.then( results => results.filter( result => result.weather ) );
}

export function useAqi( lat, long ) {
	const [ aqi, setAqi ] = useState( null );

	useEffect( () => {
		if ( ! lat || ! long ) {
			return;
		}

		getAqi( lat, long ).then( setAqi );
	}, [ lat, long ] );

	return aqi;
}

export function usePeople( sortKey ) {
	const [ people, setPeople ] = useState( null );

	useEffect( () => {
		function update() {
			getPeopleAndWeather()
				.then( setPeople )
				.catch( console.error );
		}

		const timer = setInterval( update, 60 * 1000 );
		update();

		return () => clearInterval( timer );
	}, [] );

	return people ? people.sort( sortBy( sortKey ) ) : null;
}
