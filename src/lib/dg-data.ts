export const DEFAULT_DG_SKILLS: Record<string, number> = {
  Accounting: 10,
  Alertness: 20,
  Anthropology: 0,
  Archeology: 0,
  Artillery: 0,
  Athletics: 30,
  Bureaucracy: 10,
  "Computer Science": 0,
  Criminology: 10,
  Demolitions: 0,
  Disguise: 10,
  Dodge: 30,
  Drive: 20,
  Firearms: 20,
  "First Aid": 10,
  Forensics: 0,
  "Heavy Machinery": 10,
  "Heavy Weapons": 0,
  History: 10,
  HUMINT: 10,
  Law: 0,
  Medicine: 0,
  "Melee Weapons": 30,
  Navigate: 10,
  Occult: 10,
  Persuade: 20,
  Pharmacy: 0,
  Psychotherapy: 10,
  Ride: 10,
  Search: 20,
  SIGINT: 0,
  Stealth: 10,
  Surgery: 0,
  Survival: 10,
  Swim: 20,
  "Unarmed Combat": 40,
  Unnatural: 0,
}

/**
 * Skills in these categories require a specific type suffix, e.g. "Science (Biology)".
 * Each typed instance is a separate skill entry. Base value for all typed skills is 0%.
 */
export const TYPED_SKILL_CATEGORIES: string[] = [
  "Art",
  "Craft",
  "Foreign Language",
  "Military Science",
  "Pilot",
  "Science",
]

export function calcDerived(stats: { STR: number; CON: number; POW: number }) {
  const HP = Math.ceil((stats.STR + stats.CON) / 2)
  const WP = stats.POW
  const SAN = stats.POW * 5
  const BP = SAN - stats.POW
  return { HP, WP, SAN, BP }
}
