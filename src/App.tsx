import { useCallback, useEffect, useMemo, useRef } from "react";
import { Button, Col, Container, Modal, Row } from "react-bootstrap";
import { v4 as uuid } from "uuid";
import { ScoreInputDialog } from "./components/dialogs/ScoreInputDialog";
import { GameInteractionContext } from "./contexts/GameInteractionContext";
import { ScoreInputContext } from "./contexts/ScoreInputContext";
import * as gu from "./gameUtils";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { useScoreInputDialog } from "./hooks/useScoreInputDialog";
import ScoreTable from "./ScoreTable";
import type { Player, PlayerId, PlayerRoundData, Round } from "./types";

const createInitialGameState = () => {
  const playerCount = 2;
  const players = gu
    .range(1, playerCount + 1)
    .map((n) => ({ id: uuid(), name: "Spieler " + n }));

  // Create 10 rounds with decreasing cards dealt from 10 to 1
  const totalRounds = 10;
  const rounds = gu.createEmptyRounds(totalRounds, players);
  return { players, rounds };
};

export default function App() {
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

  const openEditPlayerDialog = useCallback(
    (player: Player) => {
      // For now just prompt for a new name
      const newName = (window.prompt("Name ändern:", player.name) ?? "").trim();
      if (newName.length === 0) {
        console.log("Aborted editing player: No name given");
        return;
      }
      player = { ...player, name: newName };
      const nextPlayers = players.map((p) => (p.id === player.id ? player : p));
      setPlayers(nextPlayers);
    },
    [players, setPlayers],
  );

  // Scroll to horizontal end when new player has been added
  const tableContainerRef = useRef<HTMLDivElement | null>(null);
  const isPlayerAddedRef = useRef(false);

  useEffect(() => {
    if (!isPlayerAddedRef.current) return;

    const table = tableContainerRef.current;
    if (table) {
      table.scrollLeft = table.scrollWidth;
    }
    isPlayerAddedRef.current = false;
  }, [players]);

  const openAddPlayerDialog = useCallback(() => {
    const name = (window.prompt("Name eingeben:") ?? "").trim();
    if (name.length === 0) {
      console.log("Aborted adding player: No name given");
      return;
    }

    const newPlayer: Player = { id: uuid(), name };
    const nextPlayers = [...players, newPlayer];
    setPlayers(nextPlayers);
    isPlayerAddedRef.current = true;

    // Add empty player record to all existing rounds
    const nextRounds = rounds.map((r) => ({
      ...r,
      playerData: {
        ...r.playerData,
        [newPlayer.id]: {},
      },
    }));
    setRounds(nextRounds);
  }, [players, rounds, setPlayers, setRounds]);

  const gameInteractionValue = useMemo(
    () => ({
      tableContainerRef,
      openScoreInputDialog,
      openEditPlayerDialog,
      openAddPlayerDialog,
    }),
    [openScoreInputDialog, openEditPlayerDialog, openAddPlayerDialog],
  );

  // --- Handlers for Game Reset ---

  const handleFullReset = () => {
    if (window.confirm("Sicher ALLES zurücksetzen?")) {
      const initialState = createInitialGameState();
      setPlayers(initialState.players);
      setRounds(initialState.rounds);
    }
  };

  const handleScoreReset = () => {
    if (
      window.confirm("Sicher alle Punkte löschen? \n(Spieler bleiben erhalten)")
    ) {
      const nextRounds = rounds.map((r) => ({
        ...r,
        playerData: gu.createEmptyPlayerDataRecords(players),
      }));
      setRounds(nextRounds);
    }
  };

  return (
    <>
      <Container fluid="lg">
        <Row>
          <Col className="px-0 px-sm-3 col-lg-auto mx-lg-auto">
            {/* --- Score Table --- */}
            <GameInteractionContext value={gameInteractionValue}>
              <ScoreTable gameData={{ players, rounds }} />
            </GameInteractionContext>
          </Col>
        </Row>

        {/* --- Game Management Panel --- */}
        <Row className="mt-2">
          <Col className="col-12 mx-auto text-start text-lg-center">
            <Button
              variant="danger"
              className="fw-bold m-1"
              onClick={handleFullReset}
            >
              <i className="bi bi-trash" /> Alles Löschen
            </Button>
            <Button
              variant="danger"
              className="fw-bold m-1"
              onClick={handleScoreReset}
            >
              <i className="bi bi-trash fw-bold" /> Punkte Löschen
            </Button>
          </Col>
        </Row>
      </Container>

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
