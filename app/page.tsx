"use client";

import { useMemo, useState } from "react";

type Cell = "empty" | "flower" | "seed";
type Turn = "dandelion" | "wind";
type Winner = "dandelion" | "wind" | null;

type Direction = {
  id: string;
  label: string;
  short: string;
  arrow: string;
  row: number;
  column: number;
  dr: number;
  dc: number;
};

const DIRECTIONS: Direction[] = [
  { id: "nw", label: "Северо-запад", short: "СЗ", arrow: "↖", row: 1, column: 1, dr: -1, dc: -1 },
  { id: "n", label: "Север", short: "С", arrow: "↑", row: 1, column: 2, dr: -1, dc: 0 },
  { id: "ne", label: "Северо-восток", short: "СВ", arrow: "↗", row: 1, column: 3, dr: -1, dc: 1 },
  { id: "w", label: "Запад", short: "З", arrow: "←", row: 2, column: 1, dr: 0, dc: -1 },
  { id: "e", label: "Восток", short: "В", arrow: "→", row: 2, column: 3, dr: 0, dc: 1 },
  { id: "sw", label: "Юго-запад", short: "ЮЗ", arrow: "↙", row: 3, column: 1, dr: 1, dc: -1 },
  { id: "s", label: "Юг", short: "Ю", arrow: "↓", row: 3, column: 2, dr: 1, dc: 0 },
  { id: "se", label: "Юго-восток", short: "ЮВ", arrow: "↘", row: 3, column: 3, dr: 1, dc: 1 },
];

const DIRECTION_ANGLES: Record<string, number> = {
  n: 0,
  ne: 45,
  e: 90,
  se: 135,
  s: 180,
  sw: 225,
  w: 270,
  nw: 315,
};

const clampDimension = (value: number, fallback = 7) =>
  Math.min(20, Math.max(3, Math.round(value || fallback)));

const createBoard = (width: number, height: number): Cell[] =>
  Array(width * height).fill("empty");

export default function Home() {
  const [widthInput, setWidthInput] = useState(7);
  const [heightInput, setHeightInput] = useState(7);
  const [width, setWidth] = useState<number | null>(null);
  const [height, setHeight] = useState<number | null>(null);
  const [cells, setCells] = useState<Cell[]>([]);
  const [turn, setTurn] = useState<Turn>("dandelion");
  const [usedDirections, setUsedDirections] = useState<string[]>([]);
  const [winner, setWinner] = useState<Winner>(null);
  const [lastAction, setLastAction] = useState("Выберите свободную клетку для первого одуванчика.");

  const emptyCount = useMemo(() => cells.filter((cell) => cell === "empty").length, [cells]);
  const flowerCount = useMemo(() => cells.filter((cell) => cell === "flower").length, [cells]);
  const seedCount = cells.length - emptyCount - flowerCount;

  function startGame(nextWidth = widthInput, nextHeight = heightInput) {
    const safeWidth = clampDimension(nextWidth);
    const safeHeight = clampDimension(nextHeight);
    setWidthInput(safeWidth);
    setHeightInput(safeHeight);
    setWidth(safeWidth);
    setHeight(safeHeight);
    setCells(createBoard(safeWidth, safeHeight));
    setTurn("dandelion");
    setUsedDirections([]);
    setWinner(null);
    setLastAction("Выберите свободную клетку для первого одуванчика.");
  }

  function plant(index: number) {
    if (!width || !height || winner || turn !== "dandelion" || cells[index] !== "empty") return;

    const next = [...cells];
    next[index] = "flower";
    const remaining = next.filter((cell) => cell === "empty").length;
    setCells(next);

    if (remaining === 0) {
      setWinner("dandelion");
      setLastAction("Последняя свободная клетка занята.");
      return;
    }

    setTurn("wind");
    setLastAction("Одуванчик посажен. Теперь выберите направление ветра.");
  }

  function blow(direction: Direction) {
    if (!width || !height || winner || turn !== "wind" || usedDirections.includes(direction.id)) return;

    const next = [...cells];
    const flowers = cells
      .map((cell, index) => (cell === "flower" ? index : -1))
      .filter((index) => index >= 0);

    for (const index of flowers) {
      let row = Math.floor(index / width) + direction.dr;
      let column = (index % width) + direction.dc;

      while (row >= 0 && row < height && column >= 0 && column < width) {
        const target = row * width + column;
        if (next[target] === "empty") next[target] = "seed";
        row += direction.dr;
        column += direction.dc;
      }
    }

    const nextUsed = [...usedDirections, direction.id];
    const remaining = next.filter((cell) => cell === "empty").length;
    setCells(next);
    setUsedDirections(nextUsed);

    if (remaining === 0) {
      setWinner("dandelion");
      setLastAction(`Ветер подул на ${direction.label.toLowerCase()}, но поле полностью заполнено.`);
    } else if (nextUsed.length === DIRECTIONS.length) {
      setWinner("wind");
      setLastAction(`Использованы все восемь направлений, а свободных клеток осталось: ${remaining}.`);
    } else {
      setTurn("dandelion");
      setLastAction(`Ветер подул на ${direction.label.toLowerCase()}. Посадите новый одуванчик.`);
    }
  }

  if (!width || !height) {
    return (
      <main className="setup-page">
        <section className="setup-card">
          <div className="brand-mark" aria-hidden="true"><span>✺</span></div>
          <p className="eyebrow">Игра на двоих — за одним экраном</p>
          <h1>Одуванчик<br />и ветер</h1>
          <p className="intro">Засейте всё поле раньше, чем ветер успеет проверить восемь сторон света.</p>

          <div className="size-picker">
            <span className="size-label">Размер поля</span>
            <div className="dimension-grid">
              <label className="dimension-field" htmlFor="board-width">
                <span>Ширина</span>
                <input id="board-width" type="number" min="3" max="20" value={widthInput} onChange={(event) => setWidthInput(Number(event.target.value))} />
                <small>клеток</small>
              </label>
              <span className="dimension-times" aria-hidden="true">×</span>
              <label className="dimension-field" htmlFor="board-height">
                <span>Высота</span>
                <input id="board-height" type="number" min="3" max="20" value={heightInput} onChange={(event) => setHeightInput(Number(event.target.value))} />
                <small>клеток</small>
              </label>
            </div>
            <div className="presets" aria-label="Готовые размеры поля">
              {[[5, 5], [8, 6], [10, 8]].map(([presetWidth, presetHeight]) => <button className={widthInput === presetWidth && heightInput === presetHeight ? "active" : ""} type="button" key={`${presetWidth}-${presetHeight}`} onClick={() => { setWidthInput(presetWidth); setHeightInput(presetHeight); }}>{presetWidth} × {presetHeight}</button>)}
            </div>
          </div>

          <button className="primary-button" type="button" onClick={() => startGame()}>Начать игру <span aria-hidden="true">→</span></button>
          <p className="setup-note">От 3 × 3 до 20 × 20 · первый ход за одуванчиком</p>
        </section>
      </main>
    );
  }

  const currentTitle = winner
    ? winner === "dandelion" ? "Победа одуванчика!" : "Победа ветра!"
    : turn === "dandelion" ? "Ход одуванчика" : "Ход ветра";

  return (
    <main className="game-page">
      <header className="game-header">
        <button className="wordmark" type="button" onClick={() => { setWidth(null); setHeight(null); }} aria-label="Вернуться к выбору размера"><span>✺</span> Одуванчик и ветер</button>
        <div className="header-actions">
          <span className="board-size-label">Поле {width} × {height}</span>
          <button className="text-button" type="button" onClick={() => startGame(width, height)}>Начать заново</button>
        </div>
      </header>

      <div className="game-layout">
        <section className="board-panel" aria-label={`Игровое поле ${width} на ${height}`}>
          <div className="board-wrap" style={{ "--board-columns": width, "--board-rows": height } as React.CSSProperties}>
            <div className="board" style={{ gridTemplateColumns: `repeat(${width}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${height}, minmax(0, 1fr))` }}>
              {cells.map((cell, index) => (
                <button
                  className={`cell ${cell}`}
                  type="button"
                  key={index}
                  onClick={() => plant(index)}
                  disabled={cell !== "empty" || turn !== "dandelion" || Boolean(winner)}
                  aria-label={`Строка ${Math.floor(index / width) + 1}, столбец ${(index % width) + 1}: ${cell === "empty" ? "пусто" : cell === "flower" ? "одуванчик" : "семя"}`}
                >
                  {cell === "flower" && <span className="flower-mark" aria-hidden="true">✺</span>}
                  {cell === "seed" && <span className="seed-mark" aria-hidden="true">•</span>}
                </button>
              ))}
            </div>
          </div>
          <div className="legend" aria-label="Обозначения">
            <span><i className="legend-flower">✺</i> Одуванчик <b>{flowerCount}</b></span>
            <span><i className="legend-seed">•</i> Семя <b>{seedCount}</b></span>
            <span><i className="legend-empty" /> Свободно <b>{emptyCount}</b></span>
          </div>
        </section>

        <aside className={`control-panel ${winner ? "finished" : ""}`}>
          <div className="turn-heading" aria-live="polite">
            <span className={`turn-icon ${winner ?? turn}`} aria-hidden="true">{winner === "wind" || (!winner && turn === "wind") ? "≈" : "✺"}</span>
            <div><p>{winner ? "Игра окончена" : `Ход ${usedDirections.length * 2 + (turn === "wind" ? 2 : 1)}`}</p><h2>{currentTitle}</h2></div>
          </div>

          {winner ? (
            <div className="result-card">
              <p>{winner === "dandelion" ? "На поле не осталось ни одной пустой клетки." : "Все направления использованы, но поле не успело зарасти."}</p>
              <div className="result-stat"><strong>{cells.length - emptyCount}</strong><span>из {cells.length}<br />клеток занято</span></div>
              <button className="primary-button" type="button" onClick={() => startGame(width, height)}>Сыграть ещё <span aria-hidden="true">↻</span></button>
              <button className="secondary-button" type="button" onClick={() => { setWidth(null); setHeight(null); }}>Изменить поле</button>
            </div>
          ) : (
            <>
              <p className="instruction">{turn === "dandelion" ? "Нажмите на любую свободную клетку — там вырастет новый одуванчик." : "Выберите ещё не использованное направление. Семена полетят от всех одуванчиков."}</p>

              <div className={`compass ${turn !== "wind" ? "inactive" : ""}`} aria-label="Направления ветра">
                {DIRECTIONS.map((direction) => {
                  const used = usedDirections.includes(direction.id);
                  return (
                    <button
                      type="button"
                      key={direction.id}
                      style={{ gridRow: direction.row, gridColumn: direction.column }}
                      className={used ? "used" : ""}
                      onClick={() => blow(direction)}
                      disabled={turn !== "wind" || used}
                      aria-label={`${direction.label}${used ? ", уже использовано" : ""}`}
                      title={direction.label}
                    ><span className="compass-arrow" style={{ transform: `rotate(${DIRECTION_ANGLES[direction.id]}deg)` }} aria-hidden="true" /><small>{direction.short}</small></button>
                  );
                })}
                <div className="compass-center" aria-hidden="true"><span>≈</span><small>ветер</small></div>
              </div>

              <div className="direction-progress">
                <div><span>Направления ветра</span><strong>{usedDirections.length} / 8</strong></div>
                <div className="progress-track"><i style={{ width: `${usedDirections.length * 12.5}%` }} /></div>
              </div>
            </>
          )}

          <p className="last-action" aria-live="polite"><span aria-hidden="true">i</span>{lastAction}</p>
        </aside>
      </div>
    </main>
  );
}
