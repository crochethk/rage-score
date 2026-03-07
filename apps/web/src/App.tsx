import { useCallback, useMemo } from "react";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Dropdown from "react-bootstrap/Dropdown";
import Row from "react-bootstrap/Row";
import type { GameState } from "./classes/GameState";
import { AddPlayerModal } from "./components/dialogs/AddPlayerModal";
import { EditPlayerModal } from "./components/dialogs/EditPlayerModal";
import { ScoreInputModal } from "./components/dialogs/ScoreInputModal";
import { HostClientControls } from "./components/ShareGame";
import type { EditPlayerDialogData } from "./contexts/EditPlayerContext";
import { GameInteractionContext } from "./contexts/GameInteractionContext";
import type { ScoreInputData } from "./contexts/ScoreInputContext";
import { useDialogState } from "./hooks/useDialogState";
import ScoreTable from "./ScoreTable";
import type { PlayerId } from "./types";

export interface AppProps {
  gs: GameState;
  /** Whether the App/ScoreTable is in read-only mode */
  readonly?: boolean;
}

export default function App({ gs, readonly = false }: AppProps) {
  const scoreInputState = useDialogState<ScoreInputData>();
  const editPlayerState = useDialogState<EditPlayerDialogData>();
  const addPlayerState = useDialogState<null>();

  // --- GameInteractionContext Value

  const openScoreInputDialog = useCallback(
    (playerId: PlayerId, roundNumber: number) => {
      scoreInputState.open({ playerId, roundNumber });
    },
    [scoreInputState],
  );

  const openEditPlayerDialog = useCallback(
    (playerId: PlayerId) => {
      editPlayerState.open({ playerId });
    },
    [editPlayerState],
  );

  const openAddPlayerDialog = useCallback(
    () => addPlayerState.open(null),
    [addPlayerState],
  );

  const reverseRounds = useCallback(() => gs.reverseRounds(), [gs]);

  const gameInteractionValue = useMemo(
    () => ({
      openScoreInputDialog,
      openEditPlayerDialog,
      openAddPlayerDialog,
      reverseRounds,
    }),
    [
      openScoreInputDialog,
      openEditPlayerDialog,
      openAddPlayerDialog,
      reverseRounds,
    ],
  );

  // --- Handlers for Game Management Panel ---

  const handleFullReset = () => {
    if (window.confirm("Sicher ALLES zurücksetzen?")) {
      gs.resetGame();
      scoreInputState.close();
    }
  };

  const handleScoreReset = () => {
    if (
      window.confirm("Sicher alle Punkte löschen? \n(Spieler bleiben erhalten)")
    )
      gs.resetScores();
  };

  return (
    <>
      <Container fluid>
        <Row>
          <Col className="px-0 px-sm-3 col-sm-auto mx-sm-auto">
            {/* --- Score Table --- */}
            <GameInteractionContext value={gameInteractionValue}>
              <ScoreTable gameData={gs} readonly={readonly} />
            </GameInteractionContext>
          </Col>
        </Row>

        {/* --- Game Management Panel --- */}
        {!readonly && (
          <Row className="mt-2">
            <Col className="col-12 mx-auto text-start text-sm-center">
              <ResetMenu
                onFullReset={handleFullReset}
                onScoreReset={handleScoreReset}
              />
              <HostClientControls />
            </Col>
          </Row>
        )}
      </Container>
      {/* --- Modals --- */}
      {scoreInputState.isOpen && (
        <ScoreInputModal
          gs={gs}
          scoreInputState={scoreInputState}
          readonly={readonly}
        />
      )}
      {editPlayerState.isOpen && (
        <EditPlayerModal gs={gs} dialogState={editPlayerState} />
      )}
      {addPlayerState.isOpen && (
        <AddPlayerModal gs={gs} dialogState={addPlayerState} />
      )}
    </>
  );
}

interface ResetMenuProps {
  onFullReset: () => void;
  onScoreReset: () => void;
}
function ResetMenu(props: ResetMenuProps) {
  const { onFullReset, onScoreReset } = props;
  return (
    <Dropdown drop="up" className="d-inline-block">
      <Dropdown.Toggle variant="danger" id="reset-dropdown">
        <i className="bi bi-trash" />
        <span className="visually-hidden">Zurücksetzen...</span>
      </Dropdown.Toggle>

      <Dropdown.Menu style={{ zIndex: "1337" }}>
        <Dropdown.Item onClick={onFullReset}>Alles löschen</Dropdown.Item>
        <Dropdown.Divider />
        <Dropdown.Item onClick={onScoreReset}>Punkte löschen</Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
}
