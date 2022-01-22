import type { GetServerSideProps } from 'next';
import Head from 'next/head'
import { getWeatherReports } from './api/weather';
import Main from '../components/Main';
import SortBar from '../components/SortBar';

type Props = {
	familyName: string,
	hot: boolean,
	reports: WeatherReport[],
	sortKey: string,
};

export default function Home( props: Props ) {
	return (
		<main>
			<Head>
				{
					props.hot ?
						<>
							<link rel="icon" href="/hot-favicon.ico" sizes="any" />
							<link rel="apple-touch-icon" href="/hot-apple-touch-icon.png" />
							<link rel="manifest" href="/hot-site.webmanifest" />
							<title>The Hottest {props.familyName}</title>
						</>
						:
						<>
							<link rel="icon" href="/favicon.ico" sizes="any" />
							<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
							<link rel="manifest" href="/site.webmanifest" />
							<title>The Coldest {props.familyName}</title>
						</>
				}
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

export const getServerSideProps: GetServerSideProps<Props> = async ( { req, query } ) => {
	const hostname = req.headers.host || 'unknown';
	const { familyName, defaultSortKey, reports } = await getWeatherReports( hostname );
	const sortKey = query.sort ? String( query.sort ) : defaultSortKey;

	return {
		props: {
			familyName,
			hot: defaultSortKey === '-temp',
			reports,
			sortKey,
		},
	};
};
