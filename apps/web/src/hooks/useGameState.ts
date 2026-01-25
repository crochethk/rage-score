import { useCallback, useMemo } from "react";
import * as clr from "../color";
import * as gu from "../gameUtils";
import type {
  GameData,
  Player,
  PlayerId,
  PlayerRoundData,
  Round,
} from "../types";
import { useLocalStorage } from "./useLocalStorage";

export interface GameState {
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

export function useGameState(): GameState {
  const defaultData = useMemo(() => createDefaultGameData(), []);

  // --- Main application state
  const handleInitialLoad = (gd: GameData) => ({
    players: sanitizePlayerColors(gd.players),
    rounds: gd.rounds,
  });

  // This automatically persists to local storage and loads from it initially
  const [gameData, setGameData] = useLocalStorage<GameData>(
    "gameData",
    defaultData,
    handleInitialLoad,
  );

  // --- State modification API ---

  const addPlayer = useCallback(
    (playerInfo: PlayerInfo) => {
      const newPlayer: Player = gu.createPlayer(
        playerInfo.name,
        playerInfo.color,
      );
      setGameData((gd) => {
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
    },
    [setGameData],
  );

  const removePlayer = useCallback(
    (pid: PlayerId) => {
      setGameData((gd) => {
        const players = gd.players.filter((p) => p.id !== pid);
        // Remove round data associated with the player
        const rounds = gd.rounds.map((r) => {
          const nextPlayerData = { ...r.playerData };
          delete nextPlayerData[pid];
          return { ...r, playerData: nextPlayerData };
        });
        return { players, rounds };
      });
    },
    [setGameData],
  );

  const updatePlayer = useCallback(
    (pid: PlayerId, updateData: PlayerUpdate) => {
      setGameData((gd) => {
        const playerIndex = gu.findPlayerIndexOrThrow(gd.players, pid);
        const updatedPlayer = { ...gd.players[playerIndex], ...updateData };
        const players = [...gd.players];
        players[playerIndex] = updatedPlayer;
        return { players, rounds: gd.rounds };
      });
    },
    [setGameData],
  );

  const updatePlayerRoundData = useCallback(
    (pid: PlayerId, roundNumber: number, updateData: PlayerRoundDataUpdate) => {
      setGameData((gd) => {
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
    },
    [setGameData],
  );

  const resetGame = useCallback(
    () => setGameData(createDefaultGameData()),
    [setGameData],
  );

  const resetScores = useCallback(() => {
    setGameData((gd) => {
      const rounds = gd.rounds.map((r) => ({
        ...r,
        playerData: gu.createEmptyPlayerDataRecords(gd.players),
      }));
      return { players: gd.players, rounds };
    });
  }, [setGameData]);

  const reverseRounds = useCallback(() => {
    setGameData((gd) => {
      const rounds = [...gd.rounds].reverse();
      return { players: gd.players, rounds };
    });
  }, [setGameData]);

  return useMemo(
    () => ({
      players: gameData.players,
      rounds: gameData.rounds,
      addPlayer,
      removePlayer,
      updatePlayer,
      updatePlayerRoundData,
      resetGame,
      resetScores,
      reverseRounds,
      setState: setGameData,
    }),
    [
      addPlayer,
      gameData.players,
      gameData.rounds,
      removePlayer,
      resetGame,
      resetScores,
      reverseRounds,
      setGameData,
      updatePlayer,
      updatePlayerRoundData,
    ],
  );
}

function createDefaultGameData(): GameData {
  const playerCount = 2;
  const players = gu
    .range(1, playerCount + 1)
    .map((n) => gu.createPlayer("Spieler " + n));

  // Create 10 rounds with decreasing cards dealt from 10 to 1
  const totalRounds = 10;
  const rounds = gu.createEmptyRounds(totalRounds, players);
  return { players, rounds };
}

function sanitizePlayerColors(players: readonly Player[]) {
  // Migration from state yet missing player colors
  return players.map((p) => (p.color ? p : { ...p, color: clr.randomRgb() }));
}
