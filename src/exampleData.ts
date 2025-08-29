import type { Player, Round } from "./types";

interface ScoreTableMockData {
  players: Player[];
  rounds: Round[];
}

export const dataSet1: ScoreTableMockData = {
  players: [
    {
      id: "p1-uuid", // generated upon player creation
      name: "Toni", // user input
    },
    {
      id: "p2-uuid",
      name: "Alex",
    },
    {
      id: "p3-uuid",
      name: "Charlie",
    },
  ],

  rounds: [
    {
      roundNumber: 1, // generated during game
      cardsDealt: 42, // configuration dependent
      playerData: {
        "p1-uuid": {
          bid: 11, // user input
          tricksTaken: 11, // user input
          bonusCardPoints: 11, // user input
        },
        "p2-uuid": {
          bid: 12,
          tricksTaken: 12,
          bonusCardPoints: 12,
        },
        "p3-uuid": {
          bid: 13,
          tricksTaken: 13,
          bonusCardPoints: 13,
        },
      },
    },
    {
      roundNumber: 2,
      cardsDealt: 43,
      playerData: {
        "p1-uuid": {
          bid: 21,
          tricksTaken: 21,
          bonusCardPoints: 21,
        },
        "p2-uuid": {
          bid: 22,
          tricksTaken: 22,
          bonusCardPoints: 22,
        },
        "p3-uuid": {
          bid: 23,
          tricksTaken: 23,
          bonusCardPoints: 23,
        },
      },
    },
    {
      roundNumber: 3,
      cardsDealt: 44,
      playerData: {
        "p1-uuid": {
          bid: 31,
          tricksTaken: 31,
          bonusCardPoints: 31,
        },
        "p2-uuid": {
          bid: 32,
          tricksTaken: 32,
          bonusCardPoints: 32,
        },
        "p3-uuid": {
          bid: 33,
          tricksTaken: 33,
          bonusCardPoints: 33,
        },
      },
    },
  ],
};
