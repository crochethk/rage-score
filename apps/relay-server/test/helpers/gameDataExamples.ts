// cSpell:disable
import { GameData, gameDataSchema } from "@repo/shared/game";
const gameDataExamples = {
  gameStartNoRounds: {
    players: [
      { id: "p-alex", name: "Alex", color: { r: 230, g: 57, b: 70 } },
      { id: "p-sam", name: "Sam", color: { r: 29, g: 53, b: 87 } },
      { id: "p-jordan", name: "Jordan", color: { r: 69, g: 123, b: 157 } },
      { id: "p-riley", name: "Riley", color: { r: 42, g: 157, b: 143 } },
    ],
    rounds: [],
  },
  oneCompletedRound: {
    players: [
      { id: "p-alex", name: "Alex", color: { r: 230, g: 57, b: 70 } },
      { id: "p-sam", name: "Sam", color: { r: 29, g: 53, b: 87 } },
      { id: "p-jordan", name: "Jordan", color: { r: 69, g: 123, b: 157 } },
      { id: "p-riley", name: "Riley", color: { r: 42, g: 157, b: 143 } },
    ],
    rounds: [
      {
        roundNumber: 1,
        cardsDealt: 10,
        playerData: {
          "p-alex": { bid: 2, tricksTaken: 2, bonusCardPoints: 5 },
          "p-sam": { bid: 3, tricksTaken: 1 },
          "p-jordan": { bid: 1, tricksTaken: 1, bonusCardPoints: 0 },
          "p-riley": { bid: 4, tricksTaken: 6, bonusCardPoints: -5 },
        },
      },
    ],
  },
  multiRoundWithOngoingRound: {
    players: [
      { id: "p-alex", name: "Alex", color: { r: 230, g: 57, b: 70 } },
      { id: "p-sam", name: "Sam", color: { r: 29, g: 53, b: 87 } },
      { id: "p-jordan", name: "Jordan", color: { r: 69, g: 123, b: 157 } },
    ],
    rounds: [
      {
        roundNumber: 1,
        cardsDealt: 8,
        playerData: {
          "p-alex": { bid: 2, tricksTaken: 2 },
          "p-sam": { bid: 3, tricksTaken: 2, bonusCardPoints: 10 },
          "p-jordan": { bid: 1, tricksTaken: 4 },
        },
      },
      {
        roundNumber: 2,
        cardsDealt: 7,
        playerData: {
          "p-alex": { bid: 1 },
          "p-sam": { bid: 2, tricksTaken: 1 },
          "p-jordan": {},
        },
      },
    ],
  },
} as const satisfies Record<string, GameData>;

export const validatedGameDataExamples = {
  gameStartNoRounds: gameDataSchema.parse(gameDataExamples.gameStartNoRounds),
  oneCompletedRound: gameDataSchema.parse(gameDataExamples.oneCompletedRound),
  multiRoundWithOngoingRound: gameDataSchema.parse(
    gameDataExamples.multiRoundWithOngoingRound,
  ),
} as const;

export const invalidGameDataExamples = {
  missingPlayerName: {
    players: [{ id: "p-alex", color: { r: 230, g: 57, b: 70 } }],
    rounds: [],
  },
  emptyPlayerIdInPlayersArray: {
    players: [{ id: "", name: "Alex", color: { r: 230, g: 57, b: 70 } }],
    rounds: [],
  },
  playerColorOutOfRange: {
    players: [{ id: "p-alex", name: "Alex", color: { r: 999, g: 57, b: 70 } }],
    rounds: [],
  },
  roundNumberIsNotInteger: {
    players: [{ id: "p-alex", name: "Alex", color: { r: 230, g: 57, b: 70 } }],
    rounds: [
      {
        roundNumber: 1.5,
        cardsDealt: 10,
        playerData: {
          "p-alex": { bid: 2, tricksTaken: 2 },
        },
      },
    ],
  },
  negativeCardsDealt: {
    players: [{ id: "p-alex", name: "Alex", color: { r: 230, g: 57, b: 70 } }],
    rounds: [
      {
        roundNumber: 1,
        cardsDealt: -1,
        playerData: {
          "p-alex": { bid: 2, tricksTaken: 2 },
        },
      },
    ],
  },
  emptyPlayerIdInRoundPlayerDataRecordKey: {
    players: [{ id: "p-alex", name: "Alex", color: { r: 230, g: 57, b: 70 } }],
    rounds: [
      {
        roundNumber: 1,
        cardsDealt: 10,
        playerData: {
          "p-alex": { bid: 1, tricksTaken: 2 },
          "": { bid: 3, tricksTaken: 4 },
        },
      },
    ],
  },
  negativeBidInPlayerRoundData: {
    players: [{ id: "p-alex", name: "Alex", color: { r: 230, g: 57, b: 70 } }],
    rounds: [
      {
        roundNumber: 1,
        cardsDealt: 10,
        playerData: {
          "p-alex": { bid: -2, tricksTaken: 2 },
        },
      },
    ],
  },
  bonusCardPointsWrongType: {
    players: [{ id: "p-alex", name: "Alex", color: { r: 230, g: 57, b: 70 } }],
    rounds: [
      {
        roundNumber: 1,
        cardsDealt: 10,
        playerData: {
          "p-alex": { bid: 2, tricksTaken: 2, bonusCardPoints: "10" },
        },
      },
    ],
  },
  roundsIsNotAnArray: {
    players: [{ id: "p-alex", name: "Alex", color: { r: 230, g: 57, b: 70 } }],
    rounds: {
      roundNumber: 1,
      cardsDealt: 10,
      playerData: {
        "p-alex": { bid: 2, tricksTaken: 2 },
      },
    },
  },
} as const satisfies Record<string, unknown>;
