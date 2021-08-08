import styles from './SortBar.module.css';

type Props = {
	sortKey: string,
	setSortKey: ( sortKey: string ) => void,
};

type SortButtonProps = Props & {
	asc: string,
	desc: string,
	name: string,
};

function SortButton ( props: SortButtonProps ) {
	const isAsc = props.asc === props.sortKey;
	const isDesc = props.desc === props.sortKey;

	function onClick () {
		props.setSortKey( isDesc ? props.asc : props.desc );
	}

	return (
		<span
			className={`${styles.button} ${isAsc ? styles.asc : ''} ${isDesc ? styles.desc : ''}`}
			onClick={onClick}
		>
			{props.name}
		</span>
	);
}

const sortOptions: { [ key: string ]: string } = {
	temp: 'Temp',
	feelsLike: '✱ Feel',
	aqi: 'AQI',
	uv: 'UV',
	humidity: 'RH%',
};

export default function SortBar ( props: Props ) {
	return (
		<div className={styles.container}>
			{
				Object.keys( sortOptions ).map( key => (
					<SortButton
						asc={key}
						desc={`-${key}`}
						key={key}
						name={sortOptions[ key ]}
						setSortKey={props.setSortKey}
						sortKey={props.sortKey}
					/>
				) )
			}
		</div>
	);
}
