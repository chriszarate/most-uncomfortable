import styles from "./Indicator.module.css";

type Props = {
  label?: string;
  lowThresholds?: [number, number, number, number];
  main: boolean;
  mainLabel?: string;
  thresholds: [number, number, number, number];
  unit?: string;
  value: number;
};

export default function Indicator(props: Props) {
  const [warning, high, danger, epic] = props.thresholds;
  const roundedValue = Math.round(props.value);
  const value = `${roundedValue}${props.unit || ""}`;

  let level = "ok";
  if (roundedValue >= epic) {
    level = "epic";
  } else if (roundedValue >= danger) {
    level = "danger";
  } else if (roundedValue >= high) {
    level = "high";
  } else if (roundedValue >= warning) {
    level = "warning";
  }

  if (props.lowThresholds) {
    const [lowWarning, lowHigh, lowDanger, lowEpic] = props.lowThresholds;

    if (roundedValue < lowEpic) {
      level = "low-epic";
    } else if (roundedValue < lowDanger) {
      level = "low-danger";
    } else if (roundedValue < lowHigh) {
      level = "low-high";
    } else if (roundedValue < lowWarning) {
      level = "low-warning";
    }
  }

  if (props.main) {
    return (
      <div className={`${styles[level]} ${styles.main}`}>
        <div className={styles.flag}>{value}</div>
        {(props.label || props.mainLabel) && (
          <div className={styles.label}>{props.mainLabel || props.label}</div>
        )}
      </div>
    );
  }

  return (
    <div className={`${styles[level]} ${styles.flag}`}>
      {props.label} {value}
    </div>
  );
}
