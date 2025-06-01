import React from "react";
import { useState } from "react";
const LOKALIZACJE = [
    { value: "plat-gorny", label: "Płat górny" },
    { value: "plat-dolny", label: "Płat dolny" },
  ];
export function LocationForm({ onSubmit, onBack }: { onSubmit: (params: any) => void; onBack: () => void }) {
    const [lokalizacja, setLokalizacja] = useState("");
    return (
      <div style={{ width: 320, background: "#090C2A", borderRadius: 8, padding: 24, margin: "40px auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ fontWeight: 600, color: "#C9C9C9", fontSize: 16 }}>Lokalizacja</div>
          <button style={{ border: "none", background: "none", color: "#C9C9C9", fontSize: 20, cursor: "pointer" }} onClick={onBack}>×</button>
        </div>
        <div style={{ marginBottom: 22 }}>
          <div style={{ color: "#C9C9C9", fontWeight: 600, fontSize: 14, marginBottom: 2 }}>Lokalizacja*</div>
          <select
            style={{
              width: "100%", height: 40, background: "#050615", border: "1px solid #225BA4",
              borderRadius: 4, color: "#fff", fontSize: 15, padding: "0 14px"
            }}
            value={lokalizacja}
            onChange={(e) => setLokalizacja(e.target.value)}
          >
            <option value="">Wybierz...</option>
            {LOKALIZACJE.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>
        </div>
        <button
          style={{
            width: "100%", background: "#00BFD9", color: "#000", border: "none", borderRadius: 4,
            padding: "10px 0", fontWeight: 600, fontSize: 16, cursor: "pointer"
          }}
          disabled={!lokalizacja}
          onClick={() => onSubmit({ lokalizacja })}
        >
          Dalej
        </button>
      </div>
    );
  }