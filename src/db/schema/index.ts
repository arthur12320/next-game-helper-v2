/**
 * This file serves as a central hub for exporting all database schemas and their relations.
 * It's organized to import all schema definitions first, followed by their corresponding relations.
 * This structure helps in managing and importing schemas consistently across the application.
 */

// Import the base schemas first
export { default as accounts } from "./accounts";
export { allowedUsers } from "./allowedUsers";
export { assets } from "./assets";
export { campaignInvites } from "./campaignInvites";
export { campaignPlayers } from "./campaignPlayers";
export { campaigns } from "./campaigns";
export { chapters } from "./chapters";
export { notifications } from "./notifications";
export { posts } from "./posts";
export { default as sessions } from "./sessions";
export { default as users } from "./users";
export { adventureJournal } from "./adventure-journal";
export { rpgsessions } from "./rpgSessions";
export { sessionPresence } from "./rpgSessions";
export { maps } from "./maps";
export { scCharacters, scCharactersRelations } from "./sc-character";
export { scSkills } from "./sc-skills";
export { globalTokens } from "./global-token";
export { conditions } from "./conditions";
export { characterConditions } from "./character-conditions";


// Then export the relations (if needed)
export { campaignInviteRelations } from "./campaignInvites";
export { campaignPlayersRelations } from "./campaignPlayers";
export { campaignRelations } from "./campaigns";
export { chapterRelations } from "./chapters";
export { postRelations } from "./posts";
export { characterConditionsRelations } from "./character-conditions";
