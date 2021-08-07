import { WeatherReport } from '../pages/api/weather';
import Indicator from './Indicator';
import styles from './Person.module.css';

type Props = {
	report: WeatherReport,
};

export default function Person ( props: Props ) {
	return (
		<div className={styles.entry}>
			<div className={styles.left}>
				<div className={styles.emoji}>
					{props.report.emoji}
				</div>
			</div>
			<div className={styles.detail}>
				<h3>{props.report.name}</h3>
				<div>
					<h4>
						<a
							href={props.report.links.weather}
							rel="noreferrer"
							target="_blank"
						>
							{props.report.currentCondition}
						</a>
						<br />
						<Indicator
							name="AQI"
							thresholds={[50, 100, 150, 200]}
							value={props.report.aqi}
						/>
						<Indicator
							name="UV"
							thresholds={[2, 5, 7, 10]}
							value={props.report.uv}
						/>
						<Indicator
							name="RH"
							thresholds={[50, 80, 90, 100]}
							unit="%"
							value={props.report.humidity}
						/>
					</h4>
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
				</div>
			</div>
		</div>
	);
}

