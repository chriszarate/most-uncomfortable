import Head from "next/head";
import Settings from "../components/Settings";

type Props = {
  reports: WeatherReport[];
  title: string;
};

export default function SettingsPage(props: Props) {
  return (
    <main>
      <Head>
        <title>Settings</title>
      </Head>
      <article>
        <Settings />
      </article>
    </main>
  );
}
