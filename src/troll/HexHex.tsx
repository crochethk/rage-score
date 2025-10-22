import "./HexHex.css";
import "./Thruster.css";
import hexhexImg from "./hexhex.png";

export function HexHex({ show }: { show: boolean }) {
  return (
    <>
      {show && (
        <div className="hexhex">
          <img src={hexhexImg} />
          <Thruster />
        </div>
      )}
    </>
  );
}

function Thruster() {
  return (
    <div className="thruster" aria-hidden="true">
      <span className="particle" />
      <span className="particle" />
      <span className="particle" />
      <span className="particle" />
      <span className="particle" />
      <span className="particle" />
      <span className="particle" />
      <span className="particle" />
      <span className="particle" />
      <span className="particle" />
      <span className="particle" />
      <span className="particle" />
      <span className="particle" />
      <span className="particle" />
      <span className="particle" />
    </div>
  );
}
