import Person from '../components/Person';
import Settings from '../components/Settings';
import { useAutoUpdatingWeather } from '../lib/hooks';

type Props = {
	reports: WeatherReport[],
	sortKey: string,
};

export default function Main( props: Props ) {
  const reports = useAutoUpdatingWeather( props.reports, props.sortKey );

	if ( 'settings' === props.sortKey ) {
		return <Settings reports={reports} />;
	}

	return (
		<>
			{
				reports.map( report => (
					<Person
						key={report.name}
						report={report}
						sortKey={props.sortKey}
					/>
				) )
			}
		</>
	);
}
