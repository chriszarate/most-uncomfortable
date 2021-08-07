import styles from './Indicator.module.css';

type Props = {
	name: string,
	thresholds: [
		number,
		number,
		number,
		number,
	],
	unit?: string,
	value?: number,
};

export default function Indicator ( props: Props ) {
	if ( ! props.value ) {
		return <span className={styles.flag}>{props.name} ▒</span>;
	}

	const [ warning, high, danger, epic ] = props.thresholds;
	const value = `${Math.round(props.value)}${props.unit || ''}`;

	let level = 'ok';
	if ( props.value > epic ) {
		level = 'epic';
	} else if ( props.value > danger ) {
		level = 'danger';
	} else if ( props.value > high ) {
		level = 'high';
	} else if ( props.value > warning ) {
		level = 'warning';
	}

	return <span className={`${styles.flag} ${styles[ level ]}`}>{props.name} {value}</span>;
}
