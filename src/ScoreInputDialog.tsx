import { Button, ButtonGroup, Col, Form, Row } from "react-bootstrap";

const range = (start: number, stop: number, step = 1) => {
  return Array.from(
    { length: Math.ceil((stop - start) / step) },
    (_, i) => start + i * step,
  );
};

export function ScoreInputDialog() {
  // TODO the range should be based on passed props, so it depends on dealt cards
  const possibleBidsOptions = range(0, 10 + 1).map((b) => (
    <option key={b} value={b}>
      {b}
    </option>
  ));

  return (
    <>
      <Row className="text-center justify-content-center">
        <Col sm="8" style={{ maxWidth: "576px" }}>
          <h5>Runde 123</h5>
          <h3>Max Musterfrau</h3>
          <Form.Floating>
            <Form.FloatingLabel
              label="Gewettet"
              controlId="bidInput"
              className="my-2"
            >
              <Form.Select
                aria-label="Gewettete Stiche"
                required
                className="text-center"
              >
                <option value="" selected>
                  ---
                </option>
                {possibleBidsOptions}
              </Form.Select>
            </Form.FloatingLabel>

            <Form.FloatingLabel
              label="Bekommen"
              controlId="tricksInput"
              className="my-2"
            >
              <Form.Select
                aria-label="Bekommene Stiche"
                required
                className="text-center"
              >
                <option value="" selected>
                  ---
                </option>
                {possibleBidsOptions}
              </Form.Select>
            </Form.FloatingLabel>

            <Form.FloatingLabel
              label="Bonus/Malus aus Karten"
              controlId="cardPointsInput"
              className="my-2"
            >
              <Form.Select
                aria-label="Bonuspunkte"
                defaultValue={0}
                className="text-center"
              >
                {range(3 * -5, 3 * 5 + 1, 5).map((p) => (
                  <option key={p} value={p}>
                    {p > 0 ? "+" + p : p}
                  </option>
                ))}
              </Form.Select>
            </Form.FloatingLabel>
          </Form.Floating>

          <div id="roundPointsDisplay">
            <i>Warte auf Eingaben...</i>
          </div>
        </Col>
      </Row>

      <Row className="mt-2 justify-content-center">
        <Col sm="8" style={{ maxWidth: "576px" }}>
          <div className="d-grid">
            <ButtonGroup vertical>
              <ButtonGroup size="lg" aria-label="Navigations-Buttons">
                <Button
                  variant="primary"
                  className="border border-primary-subtle border-1"
                  aria-label="Zum vorherigen Spieler"
                >
                  ←
                </Button>
                <Button
                  variant="primary"
                  className="border border-primary-subtle border-1"
                  aria-label="Zum nächsten Spieler"
                >
                  →
                </Button>
              </ButtonGroup>
              <Button
                variant="secondary"
                className="border border-secondary-subtle border-1"
              >
                Fertig
              </Button>
            </ButtonGroup>
          </div>
        </Col>
      </Row>
    </>
  );
}
