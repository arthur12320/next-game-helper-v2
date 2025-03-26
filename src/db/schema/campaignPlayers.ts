import { pgTable, uuid} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import users from "./users";
import { campaigns } from "./campaigns";

export const campaignPlayers = pgTable("campaign_players", {
    campaignId: uuid("campaign_id").notNull().references(() => campaigns.id, { onDelete: "cascade" }),
    playerId: uuid("player_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  });
  
  export const campaignPlayersRelations = relations(campaignPlayers, ({ one }) => ({
    campaign: one(campaigns, {
      fields: [campaignPlayers.campaignId],
      references: [campaigns.id],
    }),
    player: one(users, {
      fields: [campaignPlayers.playerId],
      references: [users.id],
    }),
  }));
  