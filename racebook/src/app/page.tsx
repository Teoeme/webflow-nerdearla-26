import { getCurrentAthlete } from "../session/current-athlete";
import { getDictionary } from "../i18n/dictionary";

export default async function Home() {
  const [currentAthlete, dictionary] = await Promise.all([
    getCurrentAthlete(),
    getDictionary(),
  ]);

  return <p>{dictionary.common.greeting(currentAthlete.name)}</p>;
}
