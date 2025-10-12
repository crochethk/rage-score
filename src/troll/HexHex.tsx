import "./HexHex.css";
import hexhexImg from "./hexhex.png";

export function HexHex({ show }: { show: boolean }) {
  return (
    <>
      <link rel="preload" href={hexhexImg} />
      {show && <img className="hexhex" src={hexhexImg} />}
    </>
  );
}
