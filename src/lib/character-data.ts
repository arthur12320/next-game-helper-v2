// Data structures for character creation

export interface Homeworld {
  id: string
  name: string
  description: string
  prompt: string
  benefits: {
    circles: number
    skills: number
  }
}

export interface Upbringing {
  id: string
  name: string
  description: string
  prompt: string
  benefits: {
    skills: number
  }
}

export interface Lifepath {
  id: string
  name: string
  skills: string[]
  traitPair: string
  prompt: string
}

export interface TraitPair {
  id: string
  name: string
  description: string
}

export const HOMEWORLDS: Homeworld[] = [
  {
    id: "core-world",
    name: "Core World",
    description: "Wealthy, stable, bureaucratic.",
    prompt: "What privilege did you take for granted that others might resent?",
    benefits: { circles: 2, skills: 2 },
  },
  {
    id: "frontier-colony",
    name: "Frontier Colony",
    description: "Harsh survival, scarce resources.",
    prompt: "What danger almost killed you before adulthood?",
    benefits: { circles: 2, skills: 2 },
  },
  {
    id: "trade-hub",
    name: "Trade Hub",
    description: "A crossroads of cultures and species.",
    prompt: "Which offworlder taught you something you still carry?",
    benefits: { circles: 2, skills: 2 },
  },
  {
    id: "industrial-world",
    name: "Industrial World",
    description: "Factories, shipyards, endless labor.",
    prompt: "What skill or craft did you inherit from the machinery around you?",
    benefits: { circles: 2, skills: 2 },
  },
  {
    id: "exotic-world",
    name: "Exotic World",
    description: "Harsh alien ecology or unusual traditions.",
    prompt: "What belief or adaptation sets you apart from the rest of the crew?",
    benefits: { circles: 2, skills: 2 },
  },
]

export const UPBRINGINGS: Upbringing[] = [
  {
    id: "family",
    name: "Family",
    description: "Kinship and obligation.",
    prompt: "Whose expectations and bounds from your family still shape your choices?",
    benefits: { skills: 3 },
  },
  {
    id: "institution",
    name: "Institution",
    description: "Monastery, academy, guild, or military school.",
    prompt: "What lesson did they drill into you that you now resist?",
    benefits: { skills: 3 },
  },
  {
    id: "street",
    name: "Street",
    description: "Hustling, surviving, improvising.",
    prompt: "Who did you betray to get by?",
    benefits: { skills: 3 },
  },
  {
    id: "machine",
    name: "Machine",
    description: "Raised among robots, AIs, or cybernetic systems.",
    prompt: "What part of humanity still feels alien to you?",
    benefits: { skills: 3 },
  },
]

export const LIFEPATHS: Lifepath[] = [
  {
    id: "soldier",
    name: "Soldier",
    skills: ["Combat Tactics", "Slug Rifle", "First Aid"],
    traitPair: "Hardened+Haunted",
    prompt: "What order did you follow that still troubles your conscience?",
  },
  {
    id: "marine",
    name: "Marine",
    skills: ["Zero-G", "Energy Rifle", "Battle Dress"],
    traitPair: "Loyal+Reckless",
    prompt: "Whose life did you save — and whose did you fail to?",
  },
  {
    id: "officer",
    name: "Officer",
    skills: ["Leadership", "Diplomacy", "Combat Tactics"],
    traitPair: "Charismatic+Burdened",
    prompt: "What command decision defined your career?",
  },
  {
    id: "mercenary",
    name: "Mercenary",
    skills: ["Intimidation", "Heavy Weapons", "Streetwise"],
    traitPair: "Ruthless+Pragmatic",
    prompt: "What contract did you break, and who still hunts you for it?",
  },
  {
    id: "security-agent",
    name: "Security Agent",
    skills: ["Recon", "Deception", "Slug Pistol"],
    traitPair: "Watchful+Paranoid",
    prompt: "Who once slipped past your watch, and what was the cost?",
  },
  {
    id: "spacer",
    name: "Spacer",
    skills: ["Navigation", "Zero-G", "Mechanics"],
    traitPair: "Starwise+Jaded",
    prompt: "What ship felt more like home than any planet?",
  },
  {
    id: "scout",
    name: "Scout",
    skills: ["Recon", "Survival", "Navigation"],
    traitPair: "Curious+Lonely",
    prompt: "What did you discover on the edge of known space?",
  },
  {
    id: "pilot",
    name: "Pilot",
    skills: ["Grav Vehicle", "Zero-G", "Comms"],
    traitPair: "Hotshot+Steady Hand",
    prompt: "What maneuver earned you fame — or notoriety?",
  },
  {
    id: "explorer",
    name: "Explorer",
    skills: ["Zoology", "Botany", "Survival"],
    traitPair: "Bold+Obsessive",
    prompt: "What strange world or creature left its mark on you?",
  },
  {
    id: "prospector",
    name: "Prospector",
    skills: ["Geology", "Mechanics", "Wheeled Vehicle"],
    traitPair: "Optimist+Greedy",
    prompt: "Did you strike it rich — or lose everything chasing a vein?",
  },
  {
    id: "scholar",
    name: "Scholar",
    skills: ["History", "Linguistics", "Mathematics"],
    traitPair: "Inquisitive+Detached",
    prompt: "What truth do you know that most refuse to believe?",
  },
  {
    id: "physician",
    name: "Physician",
    skills: ["First Aid", "Surgery", "Pharmacology"],
    traitPair: "Compassionate+Clinical",
    prompt: "Whose life couldn't you save?",
  },
  {
    id: "scientist",
    name: "Scientist",
    skills: ["Physics", "Chemistry", "Computer"],
    traitPair: "Brilliant+Absent-Minded",
    prompt: "What experiment changed your career forever?",
  },
  {
    id: "xenobiologist",
    name: "Xenobiologist",
    skills: ["Zoology", "Ecology", "Genetics"],
    traitPair: "Enthralled+Cautious",
    prompt: "What alien lifeform still fascinates — or haunts — you?",
  },
  {
    id: "historian",
    name: "Historian",
    skills: ["History", "Sociology", "Astronomy"],
    traitPair: "Traditionalist+Revisionist",
    prompt: "Which forgotten past shapes how you see the present?",
  },
  {
    id: "diplomat",
    name: "Diplomat",
    skills: ["Diplomacy", "Etiquette", "Empathy"],
    traitPair: "Silver-Tongued+Compromised",
    prompt: "What treaty did you shape, and who did it betray?",
  },
  {
    id: "trader",
    name: "Trader",
    skills: ["Barter", "Economics", "Streetwise"],
    traitPair: "Shrewd+Opportunist",
    prompt: "What deal made your fortune — or ruined you?",
  },
  {
    id: "performer",
    name: "Performer",
    skills: ["Performance", "Seduction", "Etiquette"],
    traitPair: "Charming+Self-Destructive",
    prompt: "What mask do you wear in public that hides your truth?",
  },
  {
    id: "priest",
    name: "Priest",
    skills: ["Empathy", "Willpower", "Sociology"],
    traitPair: "Devout+Doubtful",
    prompt: "Who placed their faith in you — and did you uphold it?",
  },
  {
    id: "politician",
    name: "Politician",
    skills: ["Leadership", "Diplomacy", "Deception"],
    traitPair: "Ambitious+Jaded",
    prompt: "What promise did you make that you never kept?",
  },
  {
    id: "criminal",
    name: "Criminal",
    skills: ["Streetwise", "Deception", "Slug Pistol"],
    traitPair: "Connected+Wanted",
    prompt: "What job went wrong and who did it hurt?",
  },
  {
    id: "smuggler",
    name: "Smuggler",
    skills: ["Navigation", "Recon", "Barter"],
    traitPair: "Bold+Two-Faced",
    prompt: "What was your most dangerous cargo?",
  },
  {
    id: "hacker",
    name: "Hacker",
    skills: ["Computer", "Electronics", "Deception"],
    traitPair: "Elusive+Obsessed",
    prompt: "Whose secrets are you still keeping?",
  },
  {
    id: "drifter",
    name: "Drifter",
    skills: ["Survival", "Athletics", "Streetwise"],
    traitPair: "Lucky+Desperate",
    prompt: "What's the closest you came to dying in the void/wilderness?",
  },
  {
    id: "rebel",
    name: "Rebel",
    skills: ["Intimidation", "Leadership", "Demolitions"],
    traitPair: "Zealous+Burned Out",
    prompt: "What cause did you fight for — and was it worth it?",
  },
]

export const TRAIT_PAIRS: TraitPair[] = [
  {
    id: "hardened-haunted",
    name: "Hardened+Haunted",
    description: "You've seen battle and carry the scars. Maybe it made you unshakable. Maybe it left you broken.",
  },
  {
    id: "loyal-reckless",
    name: "Loyal+Reckless",
    description: "Fiercely protective of your comrades, but sometimes you throw yourself into danger without thought.",
  },
  // ... add all other trait pairs
]
