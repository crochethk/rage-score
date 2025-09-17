import { useCallback, useMemo } from "react";
import { Button, Modal } from "react-bootstrap";
import { v4 as uuid } from "uuid";
import { ScoreInputDialog } from "./components/dialogs/ScoreInputDialog";
import { GameInteractionContext } from "./contexts/GameInteractionContext";
import { ScoreInputContext } from "./contexts/ScoreInputContext";
import * as gu from "./gameUtils";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { useScoreInputDialog } from "./hooks/useScoreInputState";
import ScoreTable from "./ScoreTable";
import type { Player, PlayerId, PlayerRoundData, Round } from "./types";

const initialGameState = (() => {
  // Create 8 players
  const playerCount = 8;
  const players = gu
    .range(1, playerCount + 1)
    .map((n) => ({ id: uuid(), name: "Spieler " + n }));
  // Create 10 rounds with decreasing cards dealt from 10 to 1
  const initRoundData = { bonusCardPoints: 0 };
  const totalRounds = 10;
  const playerData = Object.fromEntries(
    players.map((p) => [p.id, { ...initRoundData }]),
  );
  const rounds = gu.range(1, totalRounds + 1).map((n) => {
    return {
      roundNumber: n,
      cardsDealt: totalRounds - n + 1,
      playerData: { ...playerData },
    };
  });
  return { players, rounds };
})();

export default function App() {
  // --- Main application state
  // This automatically persists to local storage and loads from it initially
  // TODO setPlayers removed to satisfy `vite build`
  const [players] = useLocalStorage<Player[]>(
    "players",
    initialGameState.players,
  );
  const [rounds, setRounds] = useLocalStorage<Round[]>(
    "rounds",
    initialGameState.rounds,
  );

  const scoreInput = useScoreInputDialog(players[0], rounds[0]);

  // --- Handlers for ScoreInputContext ---

  const handleScoreInput = useCallback(
    (pid: PlayerId, newPlayerRoundData: Partial<PlayerRoundData>) => {
      const updatedRound = { ...scoreInput.round };
      updatedRound.playerData[pid] = newPlayerRoundData;
      scoreInput.setRound(updatedRound);
      const roundIndex = rounds.findIndex(
        (r) => r.roundNumber === updatedRound.roundNumber,
      );
      if (roundIndex !== -1) {
        // Update existing round
        const updatedRounds = [...rounds];
        updatedRounds[roundIndex] = updatedRound;
        setRounds(updatedRounds);
      }
    },
    [rounds, scoreInput, setRounds],
  );

  const handleNextPlayer = useCallback(
    (currentId: PlayerId) => {
      const next = gu.getAdjacentPlayer(players, currentId, "next");
      scoreInput.setPlayer(next);
    },
    [players, scoreInput],
  );

  const handlePrevPlayer = useCallback(
    (currentId: PlayerId) => {
      const prev = gu.getAdjacentPlayer(players, currentId, "prev");
      scoreInput.setPlayer(prev);
    },
    [players, scoreInput],
  );

  const scoreInputCtxValue = useMemo(
    () => ({
      onScoreInput: handleScoreInput,
      onNextPlayer: handleNextPlayer,
      onPrevPlayer: handlePrevPlayer,
      onDone: scoreInput.close,
    }),
    [handleNextPlayer, handlePrevPlayer, handleScoreInput, scoreInput.close],
  );

  // --- GameInteractionContext Value

  const openScoreInputDialog = useCallback(
    (player: Player, round: Round) => {
      scoreInput.setPlayer(player);
      scoreInput.setRound(round);
      scoreInput.open();
    },
    [scoreInput],
  );

  const gameInteractionValue = useMemo(
    () => ({
      openScoreInputDialog,
    }),
    [openScoreInputDialog],
  );

  return (
    <>
      <GameInteractionContext value={gameInteractionValue}>
        <ScoreTable gameData={{ players, rounds }} />
      </GameInteractionContext>

      {/* --- ScoreInputDialog Modal --- */}
      <ScoreInputContext value={scoreInputCtxValue}>
        <Modal
          show={scoreInput.isOpen}
          centered
          fullscreen="xs-down"
          onHide={scoreInput.close}
        >
          <Modal.Body>
            <ScoreInputDialog
              player={scoreInput.player}
              round={scoreInput.round}
            />
          </Modal.Body>
        </Modal>
      </ScoreInputContext>
      <ResetButton />
    </>
  );
}

function ResetButton() {
  return (
    <Button
      variant="danger"
      className="min-vw-25 fw-bold"
      onClick={() => {
        if (window.confirm("Spielstand wirklich zurücksetzen?")) {
          localStorage.clear();
          window.location.reload();
        }
      }}
    >
      Reset
    </Button>
  );
}
