import { useState } from 'react';
import type { GetServerSideProps } from 'next';
import Head from 'next/head'
import { getWeatherReports } from './api/weather';
import Main from '../components/Main';
import SortBar from '../components/SortBar';

type Props = {
	reports: WeatherReport[],
	sortKey: string,
};

export default function Home( props: Props ) {
	const [ sortKey, setSortKey ] = useState<string>( props.sortKey )

	return (
		<main>
			<Head>
				<title>The Mostest {process.env.FAMILY_NAME || ''}</title>
			</Head>
			<article>
				<Main
					reports={props.reports}
					sortKey={sortKey}
				/>
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
			reports,
		},
	};
};
