export default function ScoreTable() {
  return (
    <>
      <table className="scoreTable">
        <thead>
          <tr>
            <th scope="col">Anzahl Karten</th>
            <th scope="col">Spieler 1</th>
            <th scope="col">Spieler 2</th>
            <th scope="col">Spieler 3</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">
              10 <i>(Runde 1)</i>
            </th>
            <td>data 1-1</td>
            <td>data 1-2</td>
            <td>data 1-3</td>
          </tr>
          <tr>
            <th scope="row">
              9 <i>(Runde 2)</i>
            </th>
            <td>data 2-1</td>
            <td>data 2-2</td>
            <td>data 2-3</td>
          </tr>
          <tr>
            <th scope="row">...</th>
            <td>...</td>
            <td>...</td>
            <td>...</td>
          </tr>
        </tbody>
      </table>
    </>
  );
}
