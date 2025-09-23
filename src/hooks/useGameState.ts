import { useMemo } from "react";
import * as gu from "../gameUtils";
import type { Player, PlayerId, PlayerRoundData, Round } from "../types";
import { useLocalStorage } from "./useLocalStorage";

export interface GameState {
  readonly players: readonly Player[];
  readonly rounds: readonly Round[];

  addPlayer: (name: string) => PlayerId;
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
}

export type PlayerUpdate = Partial<Omit<Player, "id">>;
export type PlayerRoundDataUpdate = Partial<PlayerRoundData>;

export function useGameState(): GameState {
  const initialState = useMemo(() => createInitialGameState(), []);

  // --- Main application state
  // This automatically persists to local storage and loads from it initially
  const [players, setPlayers] = useLocalStorage<Player[]>(
    "players",
    initialState.players,
  );
  const [rounds, setRounds] = useLocalStorage<Round[]>(
    "rounds",
    initialState.rounds,
  );

  // --- State modification API ---

  const addPlayer = (name: string) => {
    const newPlayer: Player = gu.createPlayer(name);
    const nextPlayers = [...players, newPlayer];
    setPlayers(nextPlayers);

    // Add empty player record to all existing rounds
    const nextRounds = rounds.map((r) => ({
      ...r,
      playerData: {
        ...r.playerData,
        [newPlayer.id]: {},
      },
    }));
    setRounds(nextRounds);
    return newPlayer.id;
  };

  const updatePlayer = (pid: PlayerId, updateData: PlayerUpdate) => {
    const playerIndex = gu.findPlayerIndex(players, pid);
    if (playerIndex === -1) {
      throw new Error(`Invariant violation: Player with id ${pid} not found`);
    }
    const updatedPlayer = { ...players[playerIndex], ...updateData };
    const nextPlayers = [...players];
    nextPlayers[playerIndex] = updatedPlayer;
    setPlayers(nextPlayers);
  };

  const updatePlayerRoundData = (
    pid: PlayerId,
    roundNumber: number,
    updateData: PlayerRoundDataUpdate,
  ) => {
    // --- Get old round
    const roundIndex = gu.findRoundIndex(rounds, roundNumber);
    if (roundIndex === -1) {
      throw new Error(
        `Invariant violation: Round with number ${roundNumber} not found`,
      );
    }
    const oldRound = rounds[roundIndex];

    // --- Get old round data for player
    const oldRoundData = oldRound.playerData[pid];
    if (!oldRoundData) {
      throw new Error(
        `Invariant violation: No PlayerRoundData exists for player ${pid} in round ${roundNumber}`,
      );
    }

    // --- Create updated playerRoundData and accordingly updated round
    const newPlayerRoundData = { ...oldRoundData, ...updateData };
    const updatedRound = { ...oldRound };
    updatedRound.playerData[pid] = newPlayerRoundData;

    // --- Update rounds array
    const nextRounds = [...rounds];
    nextRounds[roundIndex] = updatedRound;
    setRounds(nextRounds);
  };

  const resetGame = () => {
    const initialState = createInitialGameState();
    setPlayers(initialState.players);
    setRounds(initialState.rounds);
  };

  const resetScores = () => {
    const nextRounds = rounds.map((r) => ({
      ...r,
      playerData: gu.createEmptyPlayerDataRecords(players),
    }));
    setRounds(nextRounds);
  };

  return {
    players,
    rounds,
    addPlayer,
    updatePlayer,
    updatePlayerRoundData,
    resetGame,
    resetScores,
  };
}

function createInitialGameState() {
  const playerCount = 2;
  const players = gu
    .range(1, playerCount + 1)
    .map((n) => gu.createPlayer("Spieler " + n));

  // Create 10 rounds with decreasing cards dealt from 10 to 1
  const totalRounds = 10;
  const rounds = gu.createEmptyRounds(totalRounds, players);
  return { players, rounds };
}
