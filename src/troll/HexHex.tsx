import "./HexHex.css";
import hexhexImg from "./hexhex.png";

export function HexHex({ show }: { show: boolean }) {
  return (
    <>
      {show && <img className="hexhex" src={hexhexImg} />}
    </>
  );
}
