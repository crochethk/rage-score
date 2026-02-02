import { z } from "zod";

export interface GameData {
  players: readonly Player[];
  rounds: readonly Round[];
}

export const playerIdSchema = z.string().nonempty();
/**
 * Unique identifier for a player.
 */
export type PlayerId = z.infer<typeof playerIdSchema>;

export const colorRgbSchema = z.object({
  r: z.int().min(0).max(255),
  g: z.int().min(0).max(255),
  b: z.int().min(0).max(255),
});
/**
 * Represents an RGB color. Each component should be in the range 0-255.
 */
export type ColorRgb = z.infer<typeof colorRgbSchema>;

/**
 * Represents a player in the game.
 */
export const playerSchema = z.object({
  /**
   * The unique identifier of the player.
   */
  id: playerIdSchema,
  /**
   * The display name of the player.
   */
  name: z.string().nonempty(),
  /**
   * The player's color, used for UI theming.
   */
  color: colorRgbSchema,
});
export type Player = z.infer<typeof playerSchema>;

export const playerRoundDataSchema = z.object({
  /**
   * The number of tricks the player bid for this round.
   */
  bid: z.int().nonnegative(),
  /**
   * The number of tricks the player actually took in this round.
   */
  tricksTaken: z.int().nonnegative(),
  /**
   * The bonus/penalty points earned from special cards in this round.
   */
  bonusCardPoints: z.int().optional(),
});
/**
 * Contains a player's data for a single round.
 */
export type PlayerRoundData = z.infer<typeof playerRoundDataSchema>;

/**
 * Represents a single round in the game.
 */
export interface Round {
  /**
   * Which round this object represents.
   */
  roundNumber: number;
  /**
   * The number of cards dealt to each player in this round.
   */
  cardsDealt: number;
  /**
   * Data of all players for this round, indexed by the player IDs.
   * PlayerRoundData may be partial if the round is still ongoing.
   */
  playerData: Record<PlayerId, Partial<PlayerRoundData>>;
}
