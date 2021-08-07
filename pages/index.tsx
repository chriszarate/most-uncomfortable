import { useState } from 'react';
import type { GetServerSideProps } from 'next';
import Head from 'next/head'
import { getWeatherReports, WeatherReport } from './api/weather';
import Person from '../components/Person';
import { useAutoUpdatingWeather } from '../lib/hooks';

type Props = {
	type: 'hot' | 'cold',
	reports: WeatherReport[],
};

export default function Home( props: Props ) {
	const [ type, setType ] = useState<'hot' | 'cold'>( props.type )
  const reports = useAutoUpdatingWeather( props.reports, type );

	function toggleType () {
		setType( 'hot' === type ? 'cold' : 'hot' );
	}

	return (
		<main>
			<Head>
				<title>The {'hot' === type ? 'Hottest' : 'Coldest'} {process.env.FAMILY_NAME}</title>
				{
					'hot' === type &&
						<style dangerouslySetInnerHTML={{ __html: ':root { --color-temp: #fcc; }' }} />
				}
			</Head>
			<article>
				{
					reports.map( report => (
						<Person
							key={report.name}
							report={report}
						/>
					) )
				}
			</article>
			<footer onClick={() => toggleType()}>🔀</footer>
		</main>
	);
}

export const getServerSideProps: GetServerSideProps<Props> = async context => {
	return {
		props: {
			reports: await getWeatherReports(),
			type: context.req.headers.host?.includes( 'hot' ) ? 'hot' : 'cold',
		},
	};
};
