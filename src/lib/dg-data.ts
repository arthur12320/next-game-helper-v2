export const DEFAULT_DG_SKILLS: Record<string, number> = {
  Accounting: 10,
  Alertness: 60,
  Anthropology: 0,
  Archeology: 0,
  Art: 0,
  Artillery: 0,
  Athletics: 60,
  Bureaucracy: 10,
  "Computer Science": 0,
  Craft: 0,
  Criminology: 10,
  Demolitions: 0,
  Disguise: 10,
  Dodge: 30,
  Drive: 20,
  Firearms: 60,
  "First Aid": 10,
  Forensics: 0,
  "Heavy Machinery": 10,
  "Heavy Weapons": 50,
  History: 10,
  HUMINT: 10,
  Law: 0,
  Medicine: 0,
  "Melee Weapons": 40,
  "Military Science (Land)": 60,
  Navigate: 50,
  Occult: 10,
  Persuade: 20,
  Pharmacy: 0,
  Pilot: 0,
  Psychotherapy: 10,
  Ride: 10,
  Science: 0,
  Search: 60,
  SIGINT: 0,
  Stealth: 60,
  Surgery: 0,
  Survival: 60,
  Swim: 50,
  "Unarmed Combat": 50,
  Unnatural: 0,
}

export function calcDerived(stats: { STR: number; CON: number; POW: number }) {
  const HP = Math.ceil((stats.STR + stats.CON) / 2)
  const WP = stats.POW
  const SAN = stats.POW * 5
  const BP = SAN - stats.POW
  return { HP, WP, SAN, BP }
}
