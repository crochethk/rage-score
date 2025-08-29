import type { Player, Round } from "./types";

interface ScoreTableMockData {
  players: Player[];
  rounds: Round[];
}

export const dataSet1: ScoreTableMockData = {
  players: [
    {
      id: "p1-uuid",
      name: "Toni",
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
      cardsDealt: 42,
      playerData: {
        "p1-uuid": {
          bid: 11,
          tricksTaken: 11,
          bonusCardPoints: 11,
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
