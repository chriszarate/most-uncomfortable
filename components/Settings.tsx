import { usePeople } from "../lib/hooks";

type SettingProps = {
  person: Person;
};

function Setting(props: SettingProps) {
  return (
    <div>
      {props.person.name}
      <a href="#">update location from {props.person.location}</a>
    </div>
  );
}

export default function Settings() {
  const people = usePeople();

  if (!people.length) {
    return null;
  }

  return (
    <div>
      {people.map((person: Person) => (
        <Setting key={person.name} person={person} />
      ))}
    </div>
  );
}
