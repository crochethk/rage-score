/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { env, type ExpansionLevel } from "../env";

const expansionStyles: Record<ExpansionLevel, CSSProperties> = {
  hidden: { display: "none" },
  semi: { height: "25vh" },
  full: { height: "90vh" },
} as const;

export function ConsoleMirror() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [expansionLevel, setExpansionLevel] = useState<ExpansionLevel>(
    env.debug.consoleExpansionLevel,
  );

  const expansionStyle = expansionStyles[expansionLevel];
  // Rotates through all levels
  const nextExpansionLevel = () => {
    setExpansionLevel((prev) => {
      const keys = Object.keys(expansionStyles);
      const prevIdx = keys.indexOf(prev);
      const nextIdx = (prevIdx + 1) % keys.length;
      return keys[nextIdx] as ExpansionLevel;
    });
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const key = "__consoleMirrorInstalled__";
    if ((window as any)[key]) return;
    (window as any)[key] = true;

    const stringify = (value: unknown) => {
      if (typeof value === "string") return value;
      try {
        return JSON.stringify(value);
      } catch {
        return String(value);
      }
    };

    const append = (type: string, args: unknown[]) => {
      const line = document.createElement("div");
      line.textContent = `[${type}] ${args.map(stringify).join(" ")}`;
      el.appendChild(line);
      el.scrollTop = el.scrollHeight;
    };

    (["log", "info", "warn", "error", "debug"] as const).forEach((type) => {
      const original = (console as any)[type].bind(console);
      (console as any)[type] = (...args: unknown[]) => {
        original(...args);
        append(type, args);
      };
    });

    // Capture XHR errors
    const originalOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (...args: any[]) {
      this.addEventListener("error", () => {
        append("xhr-error", [`${args[0]} ${args[1]}`]);
      });
      // @ts-expect-error i don't care
      return originalOpen.apply(this, args);
    };

    // Capture CORS and network errors
    window.addEventListener("error", (event) => {
      if (event.message) {
        append("error", [event.message]);
      }
    });
  }, []);

  return (
    <>
      <div
        style={{
          zIndex: 1337,
          position: "absolute",
          left: "50%",
          translate: "-50% 0",
          top: 0,
          paddingTop: "calc(env(safe-area-inset-top) - 10px)",
        }}
      >
        <button
          type="button"
          onClick={nextExpansionLevel}
          style={{
            padding: "0.25rem 0.5rem",
            fontSize: "0.75rem",
          }}
        >
          Toggle Console
        </button>
      </div>
      <div style={{ minHeight: "1rem" }}>
        <div
          ref={containerRef}
          style={{
            overflow: "scroll",
            fontFamily: "monospace",
            whiteSpace: "pre-wrap",
            padding: "0.5rem",
            backgroundColor: "rgba(0,0,0,0.45)",
            ...expansionStyle,
          }}
        />
      </div>
    </>
  );
}
