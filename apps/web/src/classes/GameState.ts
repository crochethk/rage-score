import * as gu from "../gameUtils";
import type {
  GameData,
  Player,
  PlayerId,
  PlayerRoundData,
  Round,
} from "../types";

export interface GameStateAPI {
  readonly players: readonly Player[];
  readonly rounds: readonly Round[];

  addPlayer: (playerInfo: PlayerInfo) => PlayerId;
  removePlayer: (pid: PlayerId) => void;
  updatePlayer: (pid: PlayerId, updateData: PlayerUpdate) => void;

  updatePlayerRoundData: (
    playerId: PlayerId,
    roundNumber: number,
    updateData: PlayerRoundDataUpdate,
  ) => void;

  /** Resets the complete game state to the default values. */
  resetGame: () => void;
  /** Resets all scores, but keeps players and rounds. */
  resetScores: () => void;
  reverseRounds: () => void;
  setState: (nextState: GameData) => void;
}

export type PlayerInfo = Omit<Player, "id">;
export type PlayerUpdate = Partial<Omit<Player, "id">>;
export type PlayerRoundDataUpdate = Partial<PlayerRoundData>;

export interface StateStrategy<T> {
  get(): T;
  set(updater: StateUpdater<T>): void;
}
export type StateUpdater<T> = T | ((prev: T) => T);

export class GameState implements GameStateAPI {
  static createDefaultGameData(): GameData {
    const playerCount = 2;
    const players = gu
      .range(1, playerCount + 1)
      .map((n) => gu.createPlayer("Spieler " + n));

    // Create 10 rounds with decreasing cards dealt from 10 to 1
    const totalRounds = 10;
    const rounds = gu.createEmptyRounds(totalRounds, players);
    return { players, rounds };
  }

  private readonly state: StateStrategy<GameData>;

  constructor(stateStrategy: StateStrategy<GameData>) {
    this.state = stateStrategy;
  }

  // Implementation would go here
  get players() {
    return this.state.get().players;
  }

  get rounds() {
    return this.state.get().rounds;
  }

  addPlayer(playerInfo: PlayerInfo): PlayerId {
    const newPlayer: Player = gu.createPlayer(
      playerInfo.name,
      playerInfo.color,
    );
    this.state.set((gd) => {
      const players = [...gd.players, newPlayer];
      // Add empty player record to all existing rounds
      const rounds = gd.rounds.map((r) => ({
        ...r,
        playerData: {
          ...r.playerData,
          [newPlayer.id]: {},
        },
      }));
      return { players, rounds };
    });

    return newPlayer.id;
  }

  removePlayer(pid: PlayerId): void {
    this.state.set((gd) => {
      const players = gd.players.filter((p) => p.id !== pid);
      // Remove round data associated with the player
      const rounds = gd.rounds.map((r) => {
        const nextPlayerData = { ...r.playerData };
        delete nextPlayerData[pid];
        return { ...r, playerData: nextPlayerData };
      });
      return { players, rounds };
    });
  }

  updatePlayer(pid: PlayerId, updateData: PlayerUpdate): void {
    this.state.set((gd) => {
      const playerIndex = gu.findPlayerIndexOrThrow(gd.players, pid);
      const updatedPlayer = { ...gd.players[playerIndex], ...updateData };
      const players = [...gd.players];
      players[playerIndex] = updatedPlayer;
      return { players, rounds: gd.rounds };
    });
  }

  updatePlayerRoundData(
    pid: PlayerId,
    roundNumber: number,
    updateData: PlayerRoundDataUpdate,
  ): void {
    this.state.set((gd) => {
      const roundIndex = gu.findRoundIndexOrThrow(gd.rounds, roundNumber);
      const oldRound = gd.rounds[roundIndex];

      // --- Get old round data for player
      const oldRoundData = oldRound.playerData[pid];
      if (!oldRoundData) {
        throw new Error(
          `Invariant violation: No PlayerRoundData exists for player ${pid} in round ${roundNumber}`,
        );
      }

      // --- Create updated PlayerRoundData
      const newRoundData = { ...oldRoundData, ...updateData };

      // Reset bonus points if tricks taken is zero or undefined
      if (
        newRoundData.bonusCardPoints &&
        (newRoundData.tricksTaken === undefined ||
          newRoundData.tricksTaken === 0)
      ) {
        newRoundData.bonusCardPoints = undefined;
      }

      // --- Create updated updated round object
      const updatedRound = { ...oldRound };
      updatedRound.playerData[pid] = newRoundData;

      // --- Update rounds array
      const rounds = [...gd.rounds];
      rounds[roundIndex] = updatedRound;

      return { players: gd.players, rounds };
    });
  }

  resetGame(): void {
    this.state.set(GameState.createDefaultGameData());
  }

  resetScores(): void {
    this.state.set((gd) => {
      const rounds = gd.rounds.map((r) => ({
        ...r,
        playerData: gu.createEmptyPlayerDataRecords(gd.players),
      }));
      return { players: gd.players, rounds };
    });
  }

  reverseRounds(): void {
    this.state.set((gd) => {
      const rounds = [...gd.rounds].reverse();
      return { players: gd.players, rounds };
    });
  }

  setState(nextState: GameData): void {
    this.state.set(nextState);
  }
}
