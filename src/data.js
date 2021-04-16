import { useEffect, useState } from 'react';
import sheetrock from 'sheetrock';
import sortBy from 'sort-by';
import config from './config';

function getTerms() {
	const domain = window.location.hostname.replace( /^[^.]+\./, '' );

	if ( 'cold' === config.type ) {
		return {
			emoji: '🥶',
			oppositeLink: `https://hottest.${domain}`,
			oppositeSuperlative: 'hottest',
			sortKey: 'temp',
			superlative: 'coldest',
		};
	}

	if ( 'hot' === config.type ) {
		return {
			emoji: '🥵',
			oppositeLink: `https://coldest.${domain}`,
			oppositeSuperlative: 'coldest',
			sortKey: '-temp',
			superlative: 'hottest',
		};
	}

	throw new Error( `Unknown type: ${config.type}` );
}

function getPlaces() {
	return new Promise( ( resolve, reject ) => {
		sheetrock( {
			url: config.sheetUrl,
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

function getWeather( location ) {
	return fetch( `https://wttr.in/${encodeURIComponent( location )}?format=j1` )
		.then( response => response.json() )
		.catch( () => null );
}

function getSummary( results ) {
	const summary = results.map( result => {
		const {
			emoji,
			name,
			location,
			verb,
			weather: {
				current_condition: [ current ],
				nearest_area: [ area ],
			},
		} = result;

		let feelsLike = '';
		if ( Math.abs( current.FeelsLikeF - current.temp_F ) > 5 ) {
			feelsLike = `${current.FeelsLikeF}°`;
		}

		let joiner = 'with';
		if ( current.weatherCode < 130 ) {
			joiner = 'and';
		}

		const latlong = `${area.latitude},${area.longitude}`;
		const plural = name.includes( '&' ) || name.includes( ' and ' );
		const condition = current.weatherDesc[0].value.toLowerCase().replace( /shower$/, 'showers' );

		return {
			emoji,
			feelsLike,
			location: location.replace( /,\s[A-Z]{2}$/, '' ),
			locationLink: `https://www.google.com/maps/@${latlong},12z`,
			name,
			plural,
			temp: current.temp_F,
			verb: plural ? `are ${verb}` : `is ${verb}`,
			weather: `${current.temp_F}° ${joiner} ${condition}`,
			weatherLink: `https://darksky.net/forecast/${latlong}/us12/en`,
		};
	} );

	summary.sort( sortBy( terms.sortKey ) );

	return summary;
}

export const terms = getTerms();

export function useSummary() {
	const [ summary, setSummary ] = useState( null );

	useEffect( () => {
		getPlaces()
			.then( places => Promise.all(
				places.map( ( [ name, location, verb, emoji ] ) => {
					if ( ! name || ! location ) {
						return {};
					}

					return getWeather( location )
						.then( weather => ( {
							emoji,
							name,
							location,
							verb,
							weather,
						} ) );
				} )
			) )
			.then( results => results.filter( result => result.weather ) )
			.then( results => setSummary( getSummary( results ) ) )
			.catch( console.error );
	}, [] );

	return summary;
}
