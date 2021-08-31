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
	const toggledSortKey = isDesc ? props.asc : props.desc;

	function onClick ( evt: React.MouseEvent<HTMLAnchorElement> ) {
		evt.preventDefault();
		props.setSortKey( toggledSortKey );
	}

	return (
		<a
			className={`${styles.button} ${isAsc ? styles.asc : ''} ${isDesc ? styles.desc : ''}`}
			href={`?sort=${toggledSortKey}`}
			onClick={onClick}
		>
			{props.name}
		</a>
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
