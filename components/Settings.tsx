type Props = {
	reports: WeatherReport[],
};

export default function Settings ( props: Props ) {
	if ( ! props.reports.length ) {
		return null;
	}

	return <div>Hello!</div>;
}
