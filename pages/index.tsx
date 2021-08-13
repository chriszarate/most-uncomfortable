import { useState } from 'react';
import type { GetServerSideProps } from 'next';
import Head from 'next/head'
import { getWeatherReports } from './api/weather';
import Person from '../components/Person';
import SortBar from '../components/SortBar';
import { useAutoUpdatingWeather } from '../lib/hooks';

type Props = {
	sortKey: string,
	reports: WeatherReport[],
};

export default function Home( props: Props ) {
	const [ sortKey, setSortKey ] = useState<string>( props.sortKey )
  const reports = useAutoUpdatingWeather( props.reports, sortKey );

	return (
		<main>
			<Head>
				<title>The Mostest {process.env.FAMILY_NAME || ''}</title>
			</Head>
			<article>
				{
					reports.map( report => (
						<Person
							key={report.name}
							report={report}
							sortKey={sortKey}
						/>
					) )
				}
				<SortBar
					sortKey={sortKey}
					setSortKey={setSortKey}
				/>
			</article>
		</main>
	);
}

export const getServerSideProps: GetServerSideProps<Props> = async () => {
	const reports = await getWeatherReports();
	const maxTemp = reports.reduce( ( acc, { temp } ) => Math.max( acc, temp ), 0 );

	return {
		props: {
			sortKey: maxTemp >= 75 ? '-temp' : 'temp',
			reports: await getWeatherReports(),
		},
	};
};
