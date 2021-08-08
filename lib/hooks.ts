import { useEffect, useState } from 'react';
import { sortBy } from 'sort-by-typescript';

function getReports(): Promise<WeatherReport[]> {
	return fetch( '/api/weather' )
		.then( response => response.json() );
}

export function useAutoUpdatingWeather( ssrReports: WeatherReport[], sortKey: string ) {
  const [ reports, setReports ] = useState<WeatherReport[]>( ssrReports );

	useEffect( () => {
		function update(): void {
			getReports().then( setReports );
		}

		const timer = setInterval( update, 60 * 1000 );

		return () => clearInterval( timer );
	}, [] );

  return reports.sort( sortBy( sortKey ) );
}
