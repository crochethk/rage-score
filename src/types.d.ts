/** Unique identifier for a player. */
type PlayerId = string;

export interface GameData {
  players: readonly Player[];
  rounds: readonly Round[];
}

/** Represents a player in the game. */
export interface Player {
  /**
   * The unique identifier of the player.
   */
  id: PlayerId;
  /**
   * The display name of the player.
   */
  name: string;
}

/**
 * Contains round-specific data for a player.
 */
export interface PlayerRoundData {
  /**
   * The number of tricks the player bid for this round.
   */
  bid: number;
  /**
   * The number of tricks the player actually took in this round.
   */
  tricksTaken: number;
  /**
   * The bonus/penalty points earned from special cards in this round.
   */
  bonusCardPoints?: number;
}

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
