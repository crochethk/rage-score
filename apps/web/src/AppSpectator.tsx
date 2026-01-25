import type { RoomId } from "@repo/shared/socket/auth";
import { useCallback, useEffect, useState } from "react";
import Spinner from "react-bootstrap/Spinner";
import { useParams } from "react-router";
import App from "./App";
import { Error, Error404 } from "./Error";
import * as mock from "./exampleData";
import { useGameState } from "./hooks/useGameState";
import type { GameData } from "./types";

// TODO: remove Mock rooms with example data
const rooms = new Map<string, GameData>([
  ["1", mock.dataSet1],
  ["2", mock.dataSet2],
  ["3", mock.dataSet3],
  ["4", mock.dataSet4],
  ["5", mock.dataSet5],
  ["42", mock.dataSet42],
]);

const emptyData = { players: [], rounds: [] };

type LoadResult =
  | { status: "loading" }
  | { status: "ok"; data: GameData }
  | { status: "404" | "error" };

export function AppSpectator() {
  const { roomId } = useParams();
  const { data, setData, status } = useLoadData(roomId);
  const gs = useGameState(() => data, setData);

  // TODO add socket connection logic for spectating a game

  switch (status) {
    case "ok":
      break;
    case "loading":
      return <FullPageSpinner />;
    case "404":
      return <Error404 />;
    case "error":
      return <Error>Ups, something went wrong.</Error>;
  }

  return (
    <>
      <hr />
      <h1 className="text-center">
        Spectating Room <code className="fw-bold text-white">{roomId}</code>
      </h1>
      <hr />
      <App gs={gs} readonly />
    </>
  );
}

function FullPageSpinner() {
  return (
    <div className="d-flex vh-100 justify-content-center align-items-center bg-dark bg-opacity-75">
      <Spinner
        animation="border"
        role="status"
        style={{
          //width: "3rem", height: "3rem",
          "--bs-spinner-animation-speed": "1.2s",
        }}
      >
        <span className="visually-hidden">Loading...</span>
      </Spinner>
    </div>
  );
}

function useLoadData(roomId?: RoomId) {
  const [loadResult, setLoadResult] = useState<LoadResult>({
    status: "loading",
  });

  useEffect(() => {
    const data = rooms.get(roomId!);
    const delay = data ? 1000 : 500;

    // Simulate async loading
    // eslint-disable-next-line
    setLoadResult({ status: "loading" });
    const timeout = setTimeout(() => {
      if (data !== undefined) {
        setLoadResult({ status: "ok", data: data });
      } else if (!roomId) {
        setLoadResult({ status: "error" });
      } else {
        setLoadResult({ status: "404" });
      }
    }, delay);
    return () => clearTimeout(timeout);
  }, [roomId]);

  const setData = useCallback(
    (updater: GameData | ((prev: GameData) => GameData)) => {
      setLoadResult((prev) => {
        console.log("setData called with updater:", updater);
        if (typeof updater === "function") {
          const prevData = prev.status === "ok" ? prev.data : emptyData;
          const newData = updater(prevData);
          return { status: "ok", data: newData };
        } else {
          return { status: "ok", data: updater };
        }
      });
    },
    [],
  );

  const data = loadResult.status === "ok" ? loadResult.data : emptyData;
  const status: LoadResult["status"] = loadResult.status;
  return { data, setData, status };
}
