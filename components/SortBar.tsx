import { useRouter } from "next/router";
import styles from "./SortBar.module.css";

type Props = {
  sortKey: string;
};

type SortButtonProps = {
  destination: string;
  isAsc: boolean;
  isDesc: boolean;
  name: string;
  onClick: (key: string) => void;
};

function SortButton(props: SortButtonProps) {
  return (
    <a
      className={`${styles.button} ${props.isAsc ? styles.asc : ""} ${
        props.isDesc ? styles.desc : ""
      }`}
      href={props.destination}
      onClick={function (evt: React.MouseEvent<HTMLAnchorElement>) {
        evt.preventDefault();
        props.onClick(props.destination);
      }}
    >
      {props.name}
    </a>
  );
}

const sortOptions: { [key: string]: string } = {
  temp: "Temp",
  feelsLike: "✱ Feel",
  aqi: "AQI",
  uv: "UV",
  humidity: "RH%",
};

function getDestinationSortKey(
  sortKey: string,
  currentSortKey: string
): string {
  const flipped = `-${sortKey}`;
  if (sortKey === currentSortKey) {
    return flipped;
  }

  if (flipped === currentSortKey) {
    return sortKey;
  }

  return currentSortKey.startsWith("-") ? flipped : sortKey;
}

export default function SortBar(props: Props) {
  const router = useRouter();

  function onClick(newRoute: string) {
    router.push(newRoute);
  }

  return (
    <div className={styles.container}>
      {Object.keys(sortOptions).map((key) => (
        <SortButton
          isAsc={key === props.sortKey}
          isDesc={`-${key}` === props.sortKey}
          destination={`?sort=${getDestinationSortKey(key, props.sortKey)}`}
          key={key}
          name={sortOptions[key]}
          onClick={onClick}
        />
      ))}
    </div>
  );
}
