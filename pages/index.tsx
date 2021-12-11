import type { GetServerSideProps } from 'next';
import Head from 'next/head'
import { getWeatherReports } from './api/weather';
import Main from '../components/Main';
import SortBar from '../components/SortBar';

type Props = {
	reports: WeatherReport[],
	sortKey: string,
	title: string,
};

export default function Home( props: Props ) {
	return (
		<main>
			<Head>
				<title>{props.title}</title>
			</Head>
			<article>
				<Main
					reports={props.reports}
					sortKey={props.sortKey}
				/>
				<SortBar
					sortKey={props.sortKey}
				/>
			</article>
		</main>
	);
}

export const getServerSideProps: GetServerSideProps<Props> = async ( { query } ) => {
	const { reports, title } = await getWeatherReports();
	const maxTemp = reports.reduce( ( acc, { temp } ) => Math.max( acc, temp ), 0 );
	const sortKey = query.sort ? String( query.sort ) : ( maxTemp >= 75 ? '-temp' : 'temp' );

	return {
		props: {
			reports,
			sortKey,
			title,
		},
	};
};
