import { useEffect, useState } from 'react';
import { sortBy } from 'sort-by-typescript';
import { WeatherReport } from '../pages/api/weather';

function getReports(): Promise<WeatherReport[]> {
	return fetch( '/api/weather' )
		.then( response => response.json() );
}

export function useAutoUpdatingWeather( ssrReports: WeatherReport[], type: 'hot' | 'cold' ) {
  const [ reports, setReports ] = useState<WeatherReport[]>( ssrReports );
	const sortKey = 'hot' === type ? '-temp' : 'temp';

	useEffect( () => {
		function update(): void {
			getReports().then( setReports );
		}

		const timer = setInterval( update, 60 * 1000 );

		return () => clearInterval( timer );
	}, [] );

  return reports.sort( sortBy( sortKey ) );
}
