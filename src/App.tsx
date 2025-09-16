import { useCallback, useEffect, useMemo } from "react";
import { Modal } from "react-bootstrap";
import { ScoreInputDialog } from "./components/dialogs/ScoreInputDialog";
import { GameInteractionContext } from "./contexts/GameInteractionContext";
import { ScoreInputContext } from "./contexts/ScoreInputContext";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { useScoreInputDialog } from "./hooks/useScoreInputState";
import ScoreTable from "./ScoreTable";
import type { Player, PlayerId, PlayerRoundData, Round } from "./types";

import { dataSet42 as demoData } from "./exampleData";

export default function App() {
  const [players, setPlayers] = useLocalStorage<Player[]>("players", []);
  const [rounds, setRounds] = useLocalStorage<Round[]>("rounds", []);

  // TODO Remove this when integrating real data input
  // --- Initialize with demo data for testing purposes only ---
  useEffect(() => {
    setPlayers(demoData.players);
    setRounds(demoData.rounds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // ----------------------------------------------------------

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

  const scoreInputCtxValue = useMemo(
    () => ({
      onScoreInput: handleScoreInput,
      onNextPlayer: undefined,
      onPrevPlayer: undefined,
      onDone: scoreInput.close,
    }),
    [handleScoreInput, scoreInput.close],
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
    </>
  );
}
