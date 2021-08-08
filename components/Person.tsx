import Indicator from './Indicator';
import styles from './Person.module.css';

type Props = {
	report: WeatherReport,
	sortKey: string,
};

export default function Person ( props: Props ) {
	const indicators: React.ComponentProps<typeof Indicator>[] = [
		{
			main: props.sortKey.endsWith( 'temp' ),
			thresholds: [70, 80, 90, 100],
			unit: '°F',
			value: props.report.temp,
		},
		{
			label: '✱',
			main: props.sortKey.endsWith( 'feelsLike' ),
			mainLabel: 'feels like',
			thresholds: [70, 80, 90, 100],
			unit: '°F',
			value: props.report.feelsLike,
		},
		{
			label: 'AQI',
			main: props.sortKey.endsWith( 'aqi' ),
			thresholds: [ 50, 100, 150, 200 ],
			value: props.report.aqi,
		},
		{
			label: 'UV',
			main: props.sortKey.endsWith( 'uv' ),
			mainLabel: 'UV index',
			thresholds: [2, 5, 7, 10],
			value: props.report.uv,
		},
		{
			label: 'RH',
			main: props.sortKey.endsWith( 'humidity' ),
			mainLabel: 'humidity',
			thresholds: [50, 80, 90, 100],
			unit: '%',
			value: props.report.humidity,
		},
	];

	const mainIndicator = indicators.find( ( { main } ) => main );
	const minorIndicators = indicators.filter( ( { main } ) => ! main );

	return (
		<div className={styles.entry}>
			<div className={styles.left}>
				<h3>{props.report.name}</h3>
				<h4 className={styles.time}>
					{`${props.report.localTime} in `}
					<a
						href={props.report.links.location}
						rel="noreferrer"
						target="_blank"
					>
						{props.report.shortLocation}
					</a>
				</h4>
				<h4 className={styles.condition}>
					<a
						href={props.report.links.weather}
						rel="noreferrer"
						target="_blank"
					>
						{props.report.currentCondition}
					</a>
				</h4>
				<div className={styles.indicators}>
					{
						minorIndicators.map( ( indicator, i ) => <Indicator key={i} {...indicator} /> )
					}
				</div>
			</div>
			<div className={styles.detail}>
				{
					mainIndicator &&
						<Indicator {...mainIndicator} />
				}
			</div>
		</div>
	);
}
