import Person from "../components/Person";
import { useAutoUpdatingWeather } from "../lib/hooks";

type Props = {
  reports: WeatherReport[];
  sortKey: string;
};

export default function Main(props: Props) {
  const reports = useAutoUpdatingWeather(props.reports, props.sortKey);

  return (
    <>
      {reports.map((report) => (
        <Person key={report.name} report={report} sortKey={props.sortKey} />
      ))}
    </>
  );
}
