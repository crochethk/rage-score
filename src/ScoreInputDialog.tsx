import { Button, Col, Form, Row } from "react-bootstrap";

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
      <Row className="text-nowrap text-center align-items-center">
        <Col xs="12" md="2">
          <Button size="lg" variant="primary">
            ← PREV
          </Button>
        </Col>

        <Col>
          <Row>
            <Col xs="12">Round XXX</Col>
            <Col xs="12">Valentino Vera</Col>
            <Col xs className="mx-auto">
              <Form.Floating>
                <Form.FloatingLabel label="Gewettet" controlId="bidInput">
                  <Form.Select aria-label="Auswahl gewetteter Stiche" required>
                    <option value="" selected>
                      ---
                    </option>
                    {possibleBidsOptions}
                  </Form.Select>
                </Form.FloatingLabel>

                <Form.FloatingLabel label="Erhalten" controlId="tricksInput">
                  <Form.Select aria-label="Auswahl erhaltener Stiche" required>
                    <option value="" selected>
                      ---
                    </option>
                    {possibleBidsOptions}
                  </Form.Select>
                </Form.FloatingLabel>

                <Form.FloatingLabel
                  label="Bonus/Malus"
                  controlId="cardPointsInput"
                >
                  <Form.Select
                    aria-label="Auswahl Bonuspunkte"
                    defaultValue={0}
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
                <i>waiting for input...</i>
              </div>
            </Col>
          </Row>
        </Col>

        <Col xs="12" md="2">
          <Button size="lg" variant="primary">
            NEXT →
          </Button>
        </Col>
      </Row>

      <Row className="mt-2">
        <Col className="text-center">
          <Button size="lg" variant="secondary">
            DONE
          </Button>
        </Col>
      </Row>
    </>
  );
}
