import styles from './Indicator.module.css';

type Props = {
	label?: string,
	main: boolean,
	mainLabel?: string,
	thresholds: [
		number,
		number,
		number,
		number,
	],
	unit?: string,
	value: number,
};

export default function Indicator ( props: Props ) {
	const [ warning, high, danger, epic ] = props.thresholds;
	const value = `${Math.round(props.value)}${props.unit || ''}`;

	let level = 'ok';
	if ( props.value >= epic ) {
		level = 'epic';
	} else if ( props.value >= danger ) {
		level = 'danger';
	} else if ( props.value >= high ) {
		level = 'high';
	} else if ( props.value >= warning ) {
		level = 'warning';
	}

	if ( props.main ) {
		return (
			<div className={`${styles[ level ]} ${styles.main}`}>
				<div className={styles.flag}>{value}</div>
				{
					( props.label || props.mainLabel ) &&
						<div className={styles.label}>{props.mainLabel || props.label}</div>
				}
			</div>
		)
	}

	return <div className={`${styles[ level ]} ${styles.flag}`}>{props.label} {value}</div>
}
