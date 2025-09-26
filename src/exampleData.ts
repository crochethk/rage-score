import type { Player, Round } from "./types";

interface ScoreTableMockData {
  players: Player[];
  rounds: Round[];
}

const _black = { r: 0, g: 0, b: 0 };

export const dataSet1: ScoreTableMockData = {
  players: [
    {
      id: "p1-uuid", // generated upon player creation
      name: "Toni", // user input
      color: _black,
    },
    { id: "p2-uuid", name: "Alex", color: _black },
    { id: "p3-uuid", name: "Charlie", color: _black },
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
        "p2-uuid": { bid: 12, tricksTaken: 12, bonusCardPoints: 12 },
        "p3-uuid": { bid: 13, tricksTaken: 13, bonusCardPoints: 13 },
      },
    },
    {
      roundNumber: 2,
      cardsDealt: 43,
      playerData: {
        "p1-uuid": { bid: 21, tricksTaken: 21, bonusCardPoints: 21 },
        "p2-uuid": { bid: 22, tricksTaken: 22, bonusCardPoints: 22 },
        "p3-uuid": { bid: 23, tricksTaken: 23, bonusCardPoints: 23 },
      },
    },
    {
      roundNumber: 3,
      cardsDealt: 44,
      playerData: {
        "p1-uuid": { bid: 31, tricksTaken: 31, bonusCardPoints: 31 },
        "p2-uuid": { bid: 32, tricksTaken: 32, bonusCardPoints: 32 },
        "p3-uuid": { bid: 33, tricksTaken: 33, bonusCardPoints: 33 },
      },
    },
  ],
};

export const dataSet2: ScoreTableMockData = {
  players: [
    { id: "p1-uuid", name: "Toni", color: _black },
    { id: "p2-uuid", name: "Alex", color: _black },
    { id: "p3-uuid", name: "Charlie", color: _black },
    { id: "p4-uuid", name: "Morgan", color: _black },
    { id: "p5-uuid", name: "Sam", color: _black },
    { id: "p6-uuid", name: "Jordan", color: _black },
    { id: "p7-uuid", name: "Taylor", color: _black },
    { id: "p8-uuid", name: "Riley", color: _black },
  ],
  rounds: [
    {
      roundNumber: 1,
      cardsDealt: 50,
      playerData: {
        "p1-uuid": { bid: 10, tricksTaken: 9, bonusCardPoints: 5 },
        "p2-uuid": { bid: 12, tricksTaken: 12, bonusCardPoints: 7 },
        "p3-uuid": { bid: 8, tricksTaken: 7, bonusCardPoints: 3 },
        "p4-uuid": { bid: 11, tricksTaken: 10, bonusCardPoints: 6 },
        "p5-uuid": { bid: 9, tricksTaken: 8, bonusCardPoints: 4 },
        "p6-uuid": { bid: 13, tricksTaken: 13, bonusCardPoints: 8 },
        "p7-uuid": { bid: 7, tricksTaken: 6, bonusCardPoints: 2 },
        "p8-uuid": { bid: 14, tricksTaken: 14, bonusCardPoints: 9 },
      },
    },
    {
      roundNumber: 2,
      cardsDealt: 51,
      playerData: {
        "p1-uuid": { bid: 11, tricksTaken: 10, bonusCardPoints: 6 },
        "p2-uuid": { bid: 13, tricksTaken: 13, bonusCardPoints: 8 },
        "p3-uuid": { bid: 9, tricksTaken: 8, bonusCardPoints: 4 },
        "p4-uuid": { bid: 12, tricksTaken: 11, bonusCardPoints: 7 },
        "p5-uuid": { bid: 10, tricksTaken: 9, bonusCardPoints: 5 },
        "p6-uuid": { bid: 14, tricksTaken: 14, bonusCardPoints: 9 },
        "p7-uuid": { bid: 8, tricksTaken: 7, bonusCardPoints: 3 },
        "p8-uuid": { bid: 15, tricksTaken: 15, bonusCardPoints: 10 },
      },
    },
    {
      roundNumber: 3,
      cardsDealt: 52,
      playerData: {
        "p1-uuid": { bid: 12, tricksTaken: 11, bonusCardPoints: 7 },
        "p2-uuid": { bid: 14, tricksTaken: 14, bonusCardPoints: 9 },
        "p3-uuid": { bid: 10, tricksTaken: 9, bonusCardPoints: 5 },
        "p4-uuid": { bid: 13, tricksTaken: 12, bonusCardPoints: 8 },
        "p5-uuid": { bid: 11, tricksTaken: 10, bonusCardPoints: 6 },
        "p6-uuid": { bid: 15, tricksTaken: 15, bonusCardPoints: 10 },
        "p7-uuid": { bid: 9, tricksTaken: 8, bonusCardPoints: 4 },
        "p8-uuid": { bid: 16, tricksTaken: 16, bonusCardPoints: 11 },
      },
    },
  ],
};

export const dataSet3: ScoreTableMockData = {
  players: [
    { id: "p1-uuid", name: "Toni", color: _black },
    { id: "p2-uuid", name: "Alex", color: _black },
    { id: "p3-uuid", name: "Charlie", color: _black },
    { id: "p4-uuid", name: "Morgan", color: _black },
    { id: "p5-uuid", name: "Sam", color: _black },
    { id: "p6-uuid", name: "Jordan", color: _black },
    { id: "p7-uuid", name: "Taylor", color: _black },
    { id: "p8-uuid", name: "Riley", color: _black },
  ],
  rounds: [
    {
      roundNumber: 1,
      cardsDealt: 50,
      playerData: {
        "p1-uuid": { bid: 10, tricksTaken: 9, bonusCardPoints: 5 },
        "p2-uuid": { bid: 12, tricksTaken: 12, bonusCardPoints: 10 },
        "p3-uuid": { bid: 8, tricksTaken: 7, bonusCardPoints: -5 },
        "p4-uuid": { bid: 11, tricksTaken: 10, bonusCardPoints: 15 },
        "p5-uuid": { bid: 9, tricksTaken: 8, bonusCardPoints: -10 },
        "p6-uuid": { bid: 13, tricksTaken: 13, bonusCardPoints: 0 },
        "p7-uuid": { bid: 7, tricksTaken: 6, bonusCardPoints: -15 },
        "p8-uuid": { bid: 14, tricksTaken: 14, bonusCardPoints: 0 },
      },
    },
    {
      roundNumber: 2,
      cardsDealt: 51,
      playerData: {
        "p1-uuid": { bid: 11, tricksTaken: 10, bonusCardPoints: 6 },
        "p2-uuid": { bid: 13, tricksTaken: 13, bonusCardPoints: 8 },
        "p3-uuid": { bid: 9, tricksTaken: 8, bonusCardPoints: 4 },
        "p4-uuid": { bid: 12, tricksTaken: 11, bonusCardPoints: 7 },
        "p5-uuid": { bid: 10, tricksTaken: 9, bonusCardPoints: 5 },
        "p6-uuid": { bid: 14, tricksTaken: 14, bonusCardPoints: 9 },
        "p7-uuid": { bid: 8, tricksTaken: 7, bonusCardPoints: 3 },
        "p8-uuid": { bid: 15, tricksTaken: 15, bonusCardPoints: 10 },
      },
    },
    {
      roundNumber: 3,
      cardsDealt: 52,
      playerData: {
        "p1-uuid": { bid: 12, tricksTaken: 11, bonusCardPoints: 7 },
        "p2-uuid": { bid: 14, tricksTaken: 14, bonusCardPoints: 9 },
        "p3-uuid": { bid: 10, tricksTaken: 9, bonusCardPoints: 5 },
        "p4-uuid": { bid: 13, tricksTaken: 12, bonusCardPoints: 8 },
        "p5-uuid": { bid: 11, tricksTaken: 10, bonusCardPoints: 6 },
        "p6-uuid": { bid: 15, tricksTaken: 15, bonusCardPoints: 10 },
        "p7-uuid": { bid: 9, tricksTaken: 8, bonusCardPoints: 4 },
        "p8-uuid": { bid: 16, tricksTaken: 16, bonusCardPoints: 11 },
      },
    },
    {
      roundNumber: 4,
      cardsDealt: 52,
      playerData: {
        "p1-uuid": { bid: 12, tricksTaken: 11, bonusCardPoints: 7 },
        "p2-uuid": { bid: 14, tricksTaken: 14, bonusCardPoints: 9 },
        "p3-uuid": { bid: 10, tricksTaken: 9, bonusCardPoints: 5 },
        "p4-uuid": { bid: 13, tricksTaken: 12, bonusCardPoints: 8 },
        "p5-uuid": { bid: 11, tricksTaken: 10, bonusCardPoints: 6 },
        "p6-uuid": { bid: 15, tricksTaken: 15, bonusCardPoints: 10 },
        "p7-uuid": { bid: 9, tricksTaken: 8, bonusCardPoints: 4 },
        "p8-uuid": { bid: 16, tricksTaken: 16, bonusCardPoints: 11 },
      },
    },
    {
      roundNumber: 5,
      cardsDealt: 52,
      playerData: {
        "p1-uuid": { bid: 12, tricksTaken: 11, bonusCardPoints: 7 },
        "p2-uuid": { bid: 14, tricksTaken: 14, bonusCardPoints: 9 },
        "p3-uuid": { bid: 10, tricksTaken: 9, bonusCardPoints: 5 },
        "p4-uuid": { bid: 13, tricksTaken: 12, bonusCardPoints: 8 },
        "p5-uuid": { bid: 11, tricksTaken: 10, bonusCardPoints: 6 },
        "p6-uuid": { bid: 15, tricksTaken: 15, bonusCardPoints: 10 },
        "p7-uuid": { bid: 9, tricksTaken: 8, bonusCardPoints: 4 },
        "p8-uuid": { bid: 16, tricksTaken: 16, bonusCardPoints: 11 },
      },
    },
    {
      roundNumber: 6,
      cardsDealt: 52,
      playerData: {
        "p1-uuid": { bid: 12, tricksTaken: 11, bonusCardPoints: 7 },
        "p2-uuid": { bid: 14, tricksTaken: 14, bonusCardPoints: 9 },
        "p3-uuid": { bid: 10, tricksTaken: 9, bonusCardPoints: 5 },
        "p4-uuid": { bid: 13, tricksTaken: 12, bonusCardPoints: 8 },
        "p5-uuid": { bid: 11, tricksTaken: 10, bonusCardPoints: 6 },
        "p6-uuid": { bid: 15, tricksTaken: 15, bonusCardPoints: 10 },
        "p7-uuid": { bid: 9, tricksTaken: 8, bonusCardPoints: 4 },
        "p8-uuid": { bid: 16, tricksTaken: 16, bonusCardPoints: 11 },
      },
    },
    {
      roundNumber: 7,
      cardsDealt: 52,
      playerData: {
        "p1-uuid": { bid: 12, tricksTaken: 11, bonusCardPoints: 7 },
        "p2-uuid": { bid: 14, tricksTaken: 14, bonusCardPoints: 9 },
        "p3-uuid": { bid: 10, tricksTaken: 9, bonusCardPoints: 5 },
        "p4-uuid": { bid: 13, tricksTaken: 12, bonusCardPoints: 8 },
        "p5-uuid": { bid: 11, tricksTaken: 10, bonusCardPoints: 6 },
        "p6-uuid": { bid: 15, tricksTaken: 15, bonusCardPoints: 10 },
        "p7-uuid": { bid: 9, tricksTaken: 8, bonusCardPoints: 4 },
        "p8-uuid": { bid: 16, tricksTaken: 16, bonusCardPoints: 11 },
      },
    },
    {
      roundNumber: 8,
      cardsDealt: 52,
      playerData: {
        "p1-uuid": { bid: 12, tricksTaken: 11, bonusCardPoints: 7 },
        "p2-uuid": { bid: 14, tricksTaken: 14, bonusCardPoints: 9 },
        "p3-uuid": { bid: 10, tricksTaken: 9, bonusCardPoints: 5 },
        "p4-uuid": { bid: 13, tricksTaken: 12, bonusCardPoints: 8 },
        "p5-uuid": { bid: 11, tricksTaken: 10, bonusCardPoints: 6 },
        "p6-uuid": { bid: 15, tricksTaken: 15, bonusCardPoints: 10 },
        "p7-uuid": { bid: 9, tricksTaken: 8, bonusCardPoints: 4 },
        "p8-uuid": { bid: 16, tricksTaken: 16, bonusCardPoints: 11 },
      },
    },
    {
      roundNumber: 9,
      cardsDealt: 52,
      playerData: {
        "p1-uuid": { bid: 12, tricksTaken: 11, bonusCardPoints: 7 },
        "p2-uuid": { bid: 14, tricksTaken: 14, bonusCardPoints: 9 },
        "p3-uuid": { bid: 10, tricksTaken: 9, bonusCardPoints: 5 },
        "p4-uuid": { bid: 13, tricksTaken: 12, bonusCardPoints: 8 },
        "p5-uuid": { bid: 11, tricksTaken: 10, bonusCardPoints: 6 },
        "p6-uuid": { bid: 15, tricksTaken: 15, bonusCardPoints: 10 },
        "p7-uuid": { bid: 9, tricksTaken: 8, bonusCardPoints: 4 },
        "p8-uuid": { bid: 16, tricksTaken: 16, bonusCardPoints: 11 },
      },
    },
    {
      roundNumber: 10,
      cardsDealt: 52,
      playerData: {
        "p1-uuid": { bid: 12, tricksTaken: 11, bonusCardPoints: 7 },
        "p2-uuid": { bid: 14, tricksTaken: 14, bonusCardPoints: 9 },
        "p3-uuid": { bid: 10, tricksTaken: 9, bonusCardPoints: 5 },
        "p4-uuid": { bid: 13, tricksTaken: 12, bonusCardPoints: 8 },
        "p5-uuid": { bid: 11, tricksTaken: 10, bonusCardPoints: 6 },
        "p6-uuid": { bid: 15, tricksTaken: 15, bonusCardPoints: 10 },
        "p7-uuid": { bid: 9, tricksTaken: 8, bonusCardPoints: 4 },
        "p8-uuid": { bid: 16, tricksTaken: 16, bonusCardPoints: 11 },
      },
    },
  ],
};

/** Typical situation with partial round data at the beginning of a game.  */
export const dataSet4: ScoreTableMockData = {
  players: [
    { id: "p1-uuid", name: "Toni", color: _black },
    { id: "p2-uuid", name: "Alex", color: _black },
    { id: "p3-uuid", name: "Charlie", color: _black },
  ],

  rounds: [
    {
      roundNumber: 1,
      cardsDealt: 42,
      playerData: {
        "p1-uuid": {
          bid: 11,
          // --- Rest not yet entered ---
        },
        "p2-uuid": {},
        "p3-uuid": {},
      },
    },
  ],
};

export const dataSet5: ScoreTableMockData = {
  players: [
    { id: "p1-uuid", name: "Toni", color: _black },
    { id: "p2-uuid", name: "Alex", color: _black },
    { id: "p3-uuid", name: "Charlie", color: _black },
  ],

  rounds: [
    {
      roundNumber: 1,
      cardsDealt: 42,
      playerData: {
        "p1-uuid": {
          bid: 11,
          tricksTaken: 11,
          bonusCardPoints: 0,
        },
        "p2-uuid": {
          bonusCardPoints: 0,
          // --- Rest not yet entered ---
        },
        "p3-uuid": {},
      },
    },
  ],
};

/** Data imported from an actual partie. */
export const dataSet42: ScoreTableMockData = {
  players: [
    { id: "ef8fcd7e-3f5a-41b3-80bb-31abd9c4203d", name: "J", color: _black },
    { id: "9f5469e7-4bd0-41b4-a10b-8f826ea48b5f", name: "K", color: _black },
    { id: "0fb22e83-e610-4757-b623-d8d60c60c206", name: "M", color: _black },
    { id: "269145df-5fa7-409b-a212-05ae9b3ed56f", name: "A", color: _black },
    { id: "208b249f-aeb4-40dd-a769-f69b8c7a542b", name: "E", color: _black },
  ],

  rounds: [
    {
      roundNumber: 1,
      cardsDealt: 10,
      playerData: {
        "ef8fcd7e-3f5a-41b3-80bb-31abd9c4203d":{bid:2,tricksTaken:5,bonusCardPoints:-5},
        "9f5469e7-4bd0-41b4-a10b-8f826ea48b5f":{bid:3,tricksTaken:2,bonusCardPoints:0},
        "0fb22e83-e610-4757-b623-d8d60c60c206":{bid:1,tricksTaken:2,bonusCardPoints:0},
        "269145df-5fa7-409b-a212-05ae9b3ed56f":{bid:1,tricksTaken:1,bonusCardPoints:0},
        "208b249f-aeb4-40dd-a769-f69b8c7a542b":{bid:0,tricksTaken:0,bonusCardPoints:0},
      }
    },
    {
      roundNumber: 2,
      cardsDealt: 9,
      playerData: {
        "ef8fcd7e-3f5a-41b3-80bb-31abd9c4203d":{bid:3,tricksTaken:2,bonusCardPoints:0},
        "9f5469e7-4bd0-41b4-a10b-8f826ea48b5f":{bid:2,tricksTaken:2,bonusCardPoints:0},
        "269145df-5fa7-409b-a212-05ae9b3ed56f":{bid:1,tricksTaken:1,bonusCardPoints:0},
        "0fb22e83-e610-4757-b623-d8d60c60c206":{bid:2,tricksTaken:2,bonusCardPoints:0},
        "208b249f-aeb4-40dd-a769-f69b8c7a542b":{bid:0,tricksTaken:2,bonusCardPoints:0},
      }
    },
    {
      roundNumber: 3,
      cardsDealt: 8,
      playerData: {
        "ef8fcd7e-3f5a-41b3-80bb-31abd9c4203d":{bid:3,tricksTaken:1,bonusCardPoints:0},
        "9f5469e7-4bd0-41b4-a10b-8f826ea48b5f":{bid:0,tricksTaken:1,bonusCardPoints:0},
        "0fb22e83-e610-4757-b623-d8d60c60c206":{bid:0,tricksTaken:0,bonusCardPoints:0},
        "269145df-5fa7-409b-a212-05ae9b3ed56f":{bid:1,tricksTaken:4,bonusCardPoints:5},
        "208b249f-aeb4-40dd-a769-f69b8c7a542b":{bid:2,tricksTaken:2,bonusCardPoints:0},
      }
    },
    {
      roundNumber: 4,
      cardsDealt: 7,
      playerData: {
        "ef8fcd7e-3f5a-41b3-80bb-31abd9c4203d":{bid:1,tricksTaken:3,bonusCardPoints:0},
        "9f5469e7-4bd0-41b4-a10b-8f826ea48b5f":{bid:0,tricksTaken:0,bonusCardPoints:0},
        "0fb22e83-e610-4757-b623-d8d60c60c206":{bid:1,tricksTaken:1,bonusCardPoints:0},
        "269145df-5fa7-409b-a212-05ae9b3ed56f":{bid:1,tricksTaken:1,bonusCardPoints:0},
        "208b249f-aeb4-40dd-a769-f69b8c7a542b":{bid:5,tricksTaken:2,bonusCardPoints:5},
      }
    },
    {
      roundNumber: 5,
      cardsDealt: 6,
      playerData: {
        "ef8fcd7e-3f5a-41b3-80bb-31abd9c4203d":{bid:2,tricksTaken:0,bonusCardPoints:0},
        "9f5469e7-4bd0-41b4-a10b-8f826ea48b5f":{bid:0,tricksTaken:0,bonusCardPoints:0},
        "0fb22e83-e610-4757-b623-d8d60c60c206":{bid:1,tricksTaken:1,bonusCardPoints:0},
        "269145df-5fa7-409b-a212-05ae9b3ed56f":{bid:1,tricksTaken:1,bonusCardPoints:0},
        "208b249f-aeb4-40dd-a769-f69b8c7a542b":{bid:3,tricksTaken:4,bonusCardPoints:5},
      }
    },
    {
      roundNumber: 6,
      cardsDealt: 5,
      playerData: {
        "ef8fcd7e-3f5a-41b3-80bb-31abd9c4203d":{bid:0,tricksTaken:0,bonusCardPoints:0},
        "9f5469e7-4bd0-41b4-a10b-8f826ea48b5f":{bid:0,tricksTaken:0,bonusCardPoints:0},
        "0fb22e83-e610-4757-b623-d8d60c60c206":{bid:2,tricksTaken:3,bonusCardPoints:0},
        "269145df-5fa7-409b-a212-05ae9b3ed56f":{bid:1,tricksTaken:2,bonusCardPoints:0},
        "208b249f-aeb4-40dd-a769-f69b8c7a542b":{bid:0,tricksTaken:0,bonusCardPoints:0},
      }
    },
    {
      roundNumber: 7,
      cardsDealt: 4,
      playerData: {
        "ef8fcd7e-3f5a-41b3-80bb-31abd9c4203d":{bid:3,tricksTaken:3,bonusCardPoints:0},
        "9f5469e7-4bd0-41b4-a10b-8f826ea48b5f":{bid:0,tricksTaken:0,bonusCardPoints:0},
        "0fb22e83-e610-4757-b623-d8d60c60c206":{bid:0,tricksTaken:0,bonusCardPoints:0},
        "269145df-5fa7-409b-a212-05ae9b3ed56f":{bid:1,tricksTaken:1,bonusCardPoints:0},
        "208b249f-aeb4-40dd-a769-f69b8c7a542b":{bid:0,tricksTaken:0,bonusCardPoints:0},
      }
    },
    {
      roundNumber: 8,
      cardsDealt: 3,
      playerData: {
        "ef8fcd7e-3f5a-41b3-80bb-31abd9c4203d":{bid:1,tricksTaken:1,bonusCardPoints:0},
        "9f5469e7-4bd0-41b4-a10b-8f826ea48b5f":{bid:1,tricksTaken:1,bonusCardPoints:0},
        "0fb22e83-e610-4757-b623-d8d60c60c206":{bid:0,tricksTaken:1,bonusCardPoints:0},
        "269145df-5fa7-409b-a212-05ae9b3ed56f":{bid:0,tricksTaken:0,bonusCardPoints:0},
        "208b249f-aeb4-40dd-a769-f69b8c7a542b":{bid:0,tricksTaken:0,bonusCardPoints:0},
      }
    },
    {
      roundNumber: 9,
      cardsDealt: 2,
      playerData: {
        "ef8fcd7e-3f5a-41b3-80bb-31abd9c4203d":{bid:0,tricksTaken:1,bonusCardPoints:0},
        "9f5469e7-4bd0-41b4-a10b-8f826ea48b5f":{bid:1,tricksTaken:0,bonusCardPoints:0},
        "0fb22e83-e610-4757-b623-d8d60c60c206":{bid:1,tricksTaken:0,bonusCardPoints:0},
        "269145df-5fa7-409b-a212-05ae9b3ed56f":{bid:2,tricksTaken:0,bonusCardPoints:0},
        "208b249f-aeb4-40dd-a769-f69b8c7a542b":{bid:1,tricksTaken:1,bonusCardPoints:0},
      }
    },
    {
      roundNumber: 10,
      cardsDealt: 1,
      playerData: {
        "ef8fcd7e-3f5a-41b3-80bb-31abd9c4203d":{bid:0,tricksTaken:0,bonusCardPoints:0},
        "9f5469e7-4bd0-41b4-a10b-8f826ea48b5f":{bid:0,tricksTaken:0,bonusCardPoints:0},
        "0fb22e83-e610-4757-b623-d8d60c60c206":{bid:1,tricksTaken:1,bonusCardPoints:0},
        "269145df-5fa7-409b-a212-05ae9b3ed56f":{bid:0,tricksTaken:0,bonusCardPoints:0},
        "208b249f-aeb4-40dd-a769-f69b8c7a542b":{bid:0,tricksTaken:0,bonusCardPoints:0},
      }
    },
  ]
};
