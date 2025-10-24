import { useCallback, useMemo } from "react";
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
  reverseRounds: () => void;
}

export type PlayerUpdate = Partial<Omit<Player, "id">>;
export type PlayerRoundDataUpdate = Partial<PlayerRoundData>;

export function useGameState(): GameState {
  const defaultState = useMemo(() => createDefaultGameState(), []);

  // --- Main application state

  const sanitizePlayers = (players: Player[]) =>
    // Migration from state yet missing player colors
    players.map((p) => (p.color ? p : { ...p, color: gu.randomRgb() }));

  // This automatically persists to local storage and loads from it initially
  const [players, setPlayers] = useLocalStorage<Player[]>(
    "players",
    defaultState.players,
    sanitizePlayers,
  );
  const [rounds, setRounds] = useLocalStorage<Round[]>(
    "rounds",
    defaultState.rounds,
  );

  // --- State modification API ---

  const addPlayer = useCallback(
    (name: string) => {
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
    },
    [players, rounds, setPlayers, setRounds],
  );

  const updatePlayer = useCallback(
    (pid: PlayerId, updateData: PlayerUpdate) => {
      const playerIndex = gu.findPlayerIndexOrThrow(players, pid);
      const updatedPlayer = { ...players[playerIndex], ...updateData };
      const nextPlayers = [...players];
      nextPlayers[playerIndex] = updatedPlayer;
      setPlayers(nextPlayers);
    },
    [players, setPlayers],
  );

  const updatePlayerRoundData = useCallback(
    (pid: PlayerId, roundNumber: number, updateData: PlayerRoundDataUpdate) => {
      const roundIndex = gu.findRoundIndexOrThrow(rounds, roundNumber);
      const oldRound = rounds[roundIndex];

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
      const nextRounds = [...rounds];
      nextRounds[roundIndex] = updatedRound;
      setRounds(nextRounds);
    },
    [rounds, setRounds],
  );

  const resetGame = useCallback(() => {
    const initialState = createDefaultGameState();
    setPlayers(initialState.players);
    setRounds(initialState.rounds);
  }, [setPlayers, setRounds]);

  const resetScores = useCallback(() => {
    const nextRounds = rounds.map((r) => ({
      ...r,
      playerData: gu.createEmptyPlayerDataRecords(players),
    }));
    setRounds(nextRounds);
  }, [players, rounds, setRounds]);

  const reverseRounds = useCallback(() => {
    const nextRounds = [...rounds].reverse();
    setRounds(nextRounds);
  }, [rounds, setRounds]);
  return useMemo(
    () => ({
      players,
      rounds,
      addPlayer,
      updatePlayer,
      updatePlayerRoundData,
      resetGame,
      resetScores,
      reverseRounds,
    }),
    [
      players,
      rounds,
      addPlayer,
      updatePlayer,
      updatePlayerRoundData,
      resetGame,
      resetScores,
      reverseRounds,
    ],
  );
}

function createDefaultGameState() {
  const playerCount = 2;
  const players = gu
    .range(1, playerCount + 1)
    .map((n) => gu.createPlayer("Spieler " + n));

  // Create 10 rounds with decreasing cards dealt from 10 to 1
  const totalRounds = 10;
  const rounds = gu.createEmptyRounds(totalRounds, players);
  return { players, rounds };
}
