import { useRouter } from 'next/router';
import styles from './SortBar.module.css';

type Props = {
	sortKey: string,
};

type SortButtonProps = Props & {
	asc: string,
	desc: string,
	name: string,
	onClick: ( key: string ) => void,
};

function SortButton ( props: SortButtonProps ) {
	const isAsc = props.asc === props.sortKey;
	const isDesc = props.desc === props.sortKey;
	const toggledSortKey = isDesc ? props.asc : props.desc;
	const destination = `?sort=${toggledSortKey}`;

	return (
		<a
			className={`${styles.button} ${isAsc ? styles.asc : ''} ${isDesc ? styles.desc : ''}`}
			href={destination}
			onClick={function ( evt: React.MouseEvent<HTMLAnchorElement> ): void {
				evt.preventDefault();
				props.onClick(destination);
			}}
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
	const router = useRouter();

	function onClick ( newRoute: string ) {
		router.push( newRoute );
	}

	return (
		<div className={styles.container}>
			{
				Object.keys( sortOptions ).map( key => (
					<SortButton
						asc={key}
						desc={`-${key}`}
						key={key}
						name={sortOptions[ key ]}
						onClick={onClick}
						sortKey={props.sortKey}
					/>
				) )
			}
		</div>
	);
}
