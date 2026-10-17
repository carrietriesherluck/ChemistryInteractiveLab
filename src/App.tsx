import { useState, useEffect, useRef } from "react";
import {
  ArrowUpRight,
  Atom,
  ChevronRight,
  FlaskConical,
  Maximize2,
  Pause,
  Play,
  RotateCcw,
  SlidersHorizontal,
  X,
  BookOpen,
  MoveUpRight,
  Info,
} from "lucide-react";
import Scene from "./Scene";
import { feedback } from "./interactions";
import {
  modes,
  molecules,
  defaults,
  explanation,
  comparisons,
  properties,
  type Mode,
  type Settings,
} from "./chemistry";
const compactLabels: Record<string, string> = {
  "Molecular sample": "Sample",
  "Neighboring molecule": "Neighbor",
  "Choose a comparison": "Compare",
  "Explore a physical property": "Property",
  "Relative temperature": "Temperature",
  "Contact geometry": "Shape",
  "Ionic charge magnitude": "Charge",
  "Relative ionic radius": "Ion radius",
  "Ion–water surface gap": "Gap",
  "Starting ion–water gap": "Starting gap",
  "Molecular separation": "Separation",
  "Neighbor orientation": "Orientation",
  "Relative polarizability": "Polarizability",
  "Relative particle size": "Size",
};
type View = "explore" | "compare" | "matter";
function Range({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  left,
  right,
  display,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  left?: string;
  right?: string;
  display?: string;
}) {
  return (
    <div className="control">
      <label>
        <span>{compactLabels[label] ?? label}</span>
        <output>{display ?? value}</output>
      </label>
      <input
        aria-label={label}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(+e.target.value)}
      />
      <div className="range-end">
        <span>{left}</span>
        <span>{right}</span>
      </div>
    </div>
  );
}
function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      className="toggle-row"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
    >
      <span>{compactLabels[label] ?? label}</span>
      <span className={`switch ${checked ? "on" : ""}`}>
        <i />
      </span>
    </button>
  );
}
function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <label className="select-control">
      <span>{compactLabels[label] ?? label}</span>
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
const samples = (ids: string[]) =>
  ids.map((id) => ({
    value: id,
    label: `${molecules[id].name} · ${molecules[id].formula}`,
  }));
export default function App() {
  const [s, setS] = useState<Settings>(defaults("hydrogen"));
  const [view, setView] = useState<View>("explore"),
    [comparison, setComparison] = useState(0),
    [property, setProperty] = useState<keyof typeof properties>("evaporation"),
    [temp, setTemp] = useState(0.5),
    [reset, setReset] = useState(0),
    [help, setHelp] = useState(false),
    [wide, setWide] = useState(false),
    [dragStatus, setDragStatus] = useState<string | null>(null);
  const guideRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!help) return;
    const before = document.activeElement as HTMLElement;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setHelp(false);
        return;
      }
      if (e.key === "Tab") {
        const els =
          guideRef.current?.querySelectorAll<HTMLElement>("button,a[href]");
        if (!els?.length) return;
        const first = els[0],
          last = els[els.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", handler);
    return () => {
      document.removeEventListener("keydown", handler);
      before?.focus();
    };
  }, [help]);
  const update = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setDragStatus(null);
    setS((old) => ({ ...old, [key]: value }));
  };
  const selectMode = (mode: Mode) => {
    setDragStatus(null);
    setS(defaults(mode));
    setView("explore");
    setReset((v) => v + 1);
  };
  const restart = () => {
    setDragStatus(null);
    setS(defaults(s.mode));
    setTemp(0.5);
    setReset((r) => r + 1);
  };
  const info =
    view === "compare"
      ? {
          title: "Change one thing. See what follows.",
          body: comparisons[comparison].why,
          detail: `Changed: ${comparisons[comparison].changed}. Controlled: ${comparisons[comparison].controlled}. These comparisons are qualitative and do not compute force values.`,
          status: "Controlled comparison · qualitative",
        }
      : view === "matter"
        ? {
            ...properties[property],
            status: "Schematic molecular model · no measured values",
          }
        : explanation(s);
  const active = modes.find((m) => m.id === s.mode)!;
  return (
    <div className="app">
      <header className="header">
        <a
          className="wordmark"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            selectMode("hydrogen");
          }}
        >
          <span className="brand-icon">
            <Atom size={23} />
          </span>
          INTERMOLECULAR<span className="brand-dot">.</span>
        </a>
        <nav aria-label="Laboratory views">
          {(
            [
              { id: "explore", name: "Explore" },
              { id: "compare", name: "Compare" },
              { id: "matter", name: "Matter" },
            ] as const
          ).map((v) => (
            <button
              key={v.id}
              className={view === v.id ? "active" : ""}
              onClick={() => {
                setView(v.id);
              }}
            >
              {v.name}
            </button>
          ))}
        </nav>
        <button
          aria-label="Open field guide"
          className="help-button"
          onClick={() => setHelp(true)}
        >
          <BookOpen size={16} />
          <span>Field guide</span>
        </button>
      </header>
      <main>
        <div className="intro">
          <h1>
            {view === "explore"
              ? "Make the invisible visible."
              : view === "compare"
                ? "Compare interactions."
                : "From molecules to matter."}
          </h1>
        </div>
        <div
          className="force-tabs"
          role="tablist"
          aria-label="Intermolecular force"
        >
          {modes.map((m) => (
            <button
              key={m.id}
              role="tab"
              aria-selected={view === "explore" && s.mode === m.id}
              className={
                view === "explore" && s.mode === m.id ? "selected" : ""
              }
              onClick={() => selectMode(m.id)}
            >
              <span className="tab-num">{m.tag}</span>
              {m.name}
              <ArrowUpRight size={16} />
            </button>
          ))}
        </div>
        <section
          className={`laboratory ${wide ? "expanded" : ""}`}
          aria-label="Interactive molecular laboratory"
        >
          <div className="workspace">
            <div className="scene-top">
              <div>
                <span className="live-dot" />
                {view === "explore"
                  ? molecules[s.sample].formula
                  : view === "compare"
                    ? "A / B"
                    : "MICRO → MACRO"}
                {view !== "explore" && (
                  <span className="scene-top-muted">
                    {view === "compare"
                      ? comparisons[comparison].name
                      : properties[property].name}
                  </span>
                )}
              </div>
              <button
                title={wide ? "Restore workspace size" : "Enlarge workspace"}
                aria-label={
                  wide ? "Restore workspace size" : "Enlarge workspace"
                }
                onClick={() => setWide(!wide)}
              >
                <Maximize2 size={17} />
              </button>
            </div>
            {view === "explore" && (
              <div className="scene-response" aria-live="polite">
                <span>{feedback(s).level}</span>
              </div>
            )}
            {view === "compare" && (
              <div className="comparison-headings">
                <span>{comparisons[comparison].a}</span>
                <span>{comparisons[comparison].b}</span>
              </div>
            )}
            <div className="render-area">
              <Scene
                s={s}
                view={view}
                comparison={comparison}
                property={property}
                temp={temp}
                reset={reset}
                onStatus={setDragStatus}
              />
            </div>
            <div className="scene-bottom">
              <div className="legend">
                <span>
                  <i className="solid-bond" />
                  Covalent
                </span>
                <span>
                  <i className="dashes" />
                  Attraction
                </span>
              </div>
              <div className="playback">
                <button
                  aria-label={s.playing ? "Pause animation" : "Play animation"}
                  title={s.playing ? "Pause" : "Play"}
                  onClick={() => update("playing", !s.playing)}
                >
                  {s.playing ? <Pause size={15} /> : <Play size={15} />}
                </button>
                <button
                  aria-label="Reset experiment and camera"
                  title="Reset experiment and camera"
                  onClick={restart}
                >
                  <RotateCcw size={15} />
                </button>
              </div>
            </div>
            <div className="scene-instruction">
              Drag to rotate · Scroll to zoom
            </div>
          </div>
          <aside className="controls">
            <div className="panel-heading">
              <SlidersHorizontal size={16} />
              <span>Controls</span>
              <span className="panel-number">
                {view === "explore"
                  ? active.tag
                  : view === "compare"
                    ? "05"
                    : "06"}
              </span>
            </div>
            <div className="controls-scroll">
              {view === "compare" ? (
                <>
                  <Select
                    label="Choose a comparison"
                    value={String(comparison)}
                    options={comparisons.map((c, i) => ({
                      value: String(i),
                      label: c.name,
                    }))}
                    onChange={(v) => {
                      setComparison(+v);
                      setReset((r) => r + 1);
                    }}
                  />
                  <div className="variable-note">
                    <span>Change</span>
                    <strong>{comparisons[comparison].changed}</strong>
                    <span>Same</span>
                    <p>{comparisons[comparison].controlled}</p>
                  </div>
                </>
              ) : view === "matter" ? (
                <>
                  <Select
                    label="Explore a physical property"
                    value={property}
                    options={Object.entries(properties).map(([key, p]) => ({
                      value: key,
                      label: p.name,
                    }))}
                    onChange={(v) => {
                      setProperty(v as keyof typeof properties);
                      setReset((r) => r + 1);
                    }}
                  />
                  {["evaporation", "vapor", "viscosity"].includes(property) && (
                    <Range
                      label="Relative temperature"
                      value={temp}
                      min={0}
                      max={1}
                      step={0.05}
                      display={
                        temp < 0.35 ? "Cool" : temp > 0.7 ? "Warm" : "Moderate"
                      }
                      onChange={setTemp}
                      left="Cooler"
                      right="Warmer"
                    />
                  )}

                  {["ice", "surface"].includes(property) && (
                    <Toggle
                      label="Attraction indicators"
                      checked={s.attractions}
                      onChange={() => update("attractions", !s.attractions)}
                    />
                  )}
                </>
              ) : (
                <>
                  {s.mode === "hydrogen" && (
                    <>
                      <Select
                        label="Molecular sample"
                        value={s.sample}
                        options={samples([
                          "water",
                          "ammonia",
                          "hf",
                          "ethanol",
                          "ether",
                        ])}
                        onChange={(v) => {
                          update("sample", v);
                          update("network", false);
                          setReset((r) => r + 1);
                        }}
                      />
                      <Select
                        label="Neighboring molecule"
                        value={s.partner}
                        options={[
                          { value: "same", label: "Same substance" },
                          ...samples(["water", "ethanol", "ether"]),
                        ]}
                        onChange={(v) => {
                          update("partner", v);
                          update("network", false);
                        }}
                      />
                    </>
                  )}
                  {s.mode === "dipole" && (
                    <Select
                      label="Molecular sample"
                      value={s.sample}
                      options={samples(["hcl", "water", "bf3", "co2", "chcl3"])}
                      onChange={(v) => update("sample", v)}
                    />
                  )}
                  {s.mode === "dispersion" && (
                    <>
                      {s.shape === "compact" && (
                        <Select
                          label="Molecular sample"
                          value={s.sample}
                          options={samples(["n2", "o2"])}
                          onChange={(v) => update("sample", v)}
                        />
                      )}
                      <Select
                        label="Contact geometry"
                        value={s.shape}
                        options={[
                          { value: "compact", label: "Diatomic pair" },
                          {
                            value: "chain",
                            label: "n-Octane · extended chain",
                          },
                          { value: "branched", label: "Isooctane · branched" },
                        ]}
                        onChange={(v) => update("shape", v)}
                      />
                    </>
                  )}
                  {s.mode === "ion" && (
                    <>
                      <div className="select-control">
                        <span>Central ion</span>
                        <div className="segmented">
                          <button
                            className={s.charge > 0 ? "chosen" : ""}
                            onClick={() => update("charge", Math.abs(s.charge))}
                          >
                            Cation +
                          </button>
                          <button
                            className={s.charge < 0 ? "chosen" : ""}
                            onClick={() =>
                              update("charge", -Math.abs(s.charge))
                            }
                          >
                            Anion −
                          </button>
                        </div>
                      </div>
                      <Range
                        label="Ionic charge magnitude"
                        value={Math.abs(s.charge)}
                        min={1}
                        max={3}
                        display={`${Math.abs(s.charge)}${s.charge > 0 ? "+" : "−"}`}
                        onChange={(v) =>
                          update("charge", v * Math.sign(s.charge))
                        }
                        left="1"
                        right="3"
                      />
                      <Range
                        label="Relative ionic radius"
                        value={s.radius}
                        min={0.4}
                        max={1}
                        step={0.05}
                        display={
                          s.radius < 0.65
                            ? "Small"
                            : s.radius > 0.8
                              ? "Large"
                              : "Medium"
                        }
                        onChange={(v) => update("radius", v)}
                        left="Smaller"
                        right="Larger"
                      />
                    </>
                  )}
                  <Range
                    label={
                      s.mode === "ion"
                        ? s.released
                          ? "Starting ion–water gap"
                          : "Ion–water surface gap"
                        : s.released
                          ? "Starting separation"
                          : "Molecular separation"
                    }
                    value={s.distance}
                    min={s.mode === "hydrogen" ? 2.6 : 2.7}
                    max={7}
                    step={0.1}
                    display={
                      s.distance < 3.5
                        ? "Close"
                        : s.distance > 4.4
                          ? "Far"
                          : "Medium"
                    }
                    onChange={(v) => update("distance", v)}
                    left="Closer"
                    right="Farther"
                  />
                  {["hydrogen", "dipole"].includes(s.mode) && (
                    <Range
                      label="Neighbor orientation"
                      value={s.angle}
                      min={-180}
                      max={180}
                      step={5}
                      display={`${s.angle}°`}
                      onChange={(v) => update("angle", v)}
                      left="−180°"
                      right="180°"
                    />
                  )}
                  {s.mode === "dispersion" && (
                    <>
                      <Range
                        label="Relative polarizability"
                        value={s.polarizability}
                        min={0.3}
                        max={1.8}
                        step={0.1}
                        display={
                          s.polarizability < 0.8
                            ? "Low"
                            : s.polarizability > 1.3
                              ? "High"
                              : "Medium"
                        }
                        onChange={(v) => update("polarizability", v)}
                        left="Less deformable"
                        right="More deformable"
                      />
                      <Range
                        label="Relative particle size"
                        value={s.size}
                        min={0.65}
                        max={1.4}
                        step={0.05}
                        onChange={(v) => update("size", v)}
                        left="Smaller"
                        right="Larger"
                      />
                    </>
                  )}
                  {s.mode !== "dispersion" && (
                    <button
                      className="release-button"
                      aria-pressed={s.released}
                      title={
                        s.released
                          ? "Restore the selected separation"
                          : "Allow a schematic approach or retreat"
                      }
                      onClick={() => update("released", !s.released)}
                    >
                      {s.released ? "Hold particles" : "Release particles"}
                      <MoveUpRight size={14} />
                    </button>
                  )}
                  <details className="view-options" key={s.mode}>
                    <summary>
                      View options <ChevronRight size={14} />
                    </summary>
                    <div className="option-toggles">
                      <Toggle
                        label="Atom labels"
                        checked={s.labels}
                        onChange={() => update("labels", !s.labels)}
                      />
                      {s.mode !== "dispersion" && (
                        <Toggle
                          label="Partial charges"
                          checked={s.charges}
                          onChange={() => update("charges", !s.charges)}
                        />
                      )}
                      <Toggle
                        label="Attraction indicators"
                        checked={s.attractions}
                        onChange={() => update("attractions", !s.attractions)}
                      />
                      {s.mode === "hydrogen" && (
                        <>
                          <Toggle
                            label="Lone-pair regions"
                            checked={s.lonePairs}
                            onChange={() => update("lonePairs", !s.lonePairs)}
                          />
                          <Toggle
                            label="Donor & acceptor labels"
                            checked={s.highlight}
                            onChange={() => update("highlight", !s.highlight)}
                          />
                          {s.sample === "water" && s.partner === "same" && (
                            <button
                              className={`network-button ${s.network ? "network-on" : ""}`}
                              onClick={() => update("network", !s.network)}
                            >
                              <Atom size={16} />
                              {s.network
                                ? "Return to two molecules"
                                : "Build a water network"}
                              <ChevronRight size={15} />
                            </button>
                          )}
                        </>
                      )}
                      {s.mode === "ion" && (
                        <Toggle
                          label="Hydration sphere"
                          checked={s.network}
                          onChange={() => update("network", !s.network)}
                        />
                      )}
                      {s.mode === "dipole" && (
                        <>
                          <Toggle
                            label="Bond dipoles"
                            checked={s.bondDipoles}
                            onChange={() =>
                              update("bondDipoles", !s.bondDipoles)
                            }
                          />
                          <Toggle
                            label="Net molecular dipoles"
                            checked={s.netDipole}
                            onChange={() => update("netDipole", !s.netDipole)}
                          />
                        </>
                      )}
                      {s.mode === "dispersion" && (
                        <Toggle
                          label="Electron-density clouds"
                          checked={s.cloud}
                          onChange={() => update("cloud", !s.cloud)}
                        />
                      )}
                    </div>
                  </details>
                </>
              )}
              <button className="model-note" onClick={() => setHelp(true)}>
                <Info size={12} />
                <span>Illustrative model</span>
              </button>
            </div>
          </aside>
        </section>
        <section className="insight quiet-insight" aria-live="polite">
          <div className="insight-symbol">
            <FlaskConical size={20} />
          </div>
          <div className="insight-content">
            <p>
              {view === "compare"
                ? comparisons[comparison].why
                : view === "matter"
                  ? {
                      evaporation:
                        "Stronger attractions make it harder for molecules to escape.",
                      vapor:
                        "Stronger attractions mean less vapor at the same temperature.",
                      surface:
                        "Cohesion makes increasing the liquid’s surface area costly.",
                      viscosity:
                        "Attractions and molecular structure can slow flow.",
                      ice: "Ice’s open hydrogen-bonded structure takes up more space.",
                    }[property]
                  : s.mode === "ion"
                    ? "Water turns its opposite partial charge toward the ion."
                    : s.mode === "dipole"
                      ? molecules[s.sample].polar
                        ? "Unlike ends attract; like ends repel."
                        : "Polar bonds can cancel, leaving no net molecular dipole."
                      : s.mode === "dispersion"
                        ? "A fleeting electron imbalance induces a dipole next door."
                        : s.sample === "ether" && s.partner === "same"
                          ? "Ether can accept a hydrogen bond, but cannot donate one."
                          : "A donor’s hydrogen is attracted to a neighboring lone pair."}
            </p>
            <details key={view + s.mode + property}>
              <summary>
                Why? <ChevronRight size={13} />
              </summary>
              <h2>{info.title}</h2>
              <p>{info.body}</p>
              <p>{info.detail}</p>
              {dragStatus && <p>{dragStatus}</p>}
            </details>
          </div>
        </section>
      </main>
      {help && (
        <div className="modal-backdrop" onClick={() => setHelp(false)}>
          <section
            ref={guideRef}
            className="guide"
            role="dialog"
            aria-modal="true"
            aria-label="Laboratory field guide"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="close"
              aria-label="Close field guide"
              autoFocus
              onClick={() => setHelp(false)}
              onKeyDown={(e) => {
                if (e.key === "Escape") setHelp(false);
              }}
            >
              <X />
            </button>
            <div className="eyebrow">THE FIELD GUIDE</div>
            <h2>One workspace. Four ways to attract.</h2>
            <p>
              Choose a force, then change one variable. Orbit by dragging the
              background; pinch or scroll to zoom. In hydrogen-bond mode, drag
              the right molecule or use the separation and orientation sliders.
            </p>
            <h3>Read the visual language</h3>
            <p>
              <strong>Solid rods</strong> are covalent bonds.{" "}
              <strong>Mint dashes</strong> are intermolecular attractions. δ+
              and δ− are partial charges; +1, +2, or −1 are full ionic charges.
              Gold arrows show bond dipoles; mint arrows show net dipoles.
            </p>
            <h3>Keep the model honest</h3>
            <p>
              These are qualitative molecular models, not force calculations.
              Held distance lets you change the pull without moving the
              particles. Release particles to show an exaggerated approach or
              retreat; this does not predict an equilibrium bond length. Solid
              covalent bonds remain intact. Electron clouds show density
              imbalances, not electron orbits. Dispersion coexists with other
              attractions. No force category is universally strongest.
            </p>
            <h3>A note on the course reference</h3>
            <p>
              We refine the supplied Unit 3 slides: all species exhibit
              dispersion; donor–acceptor rules allow water–ether hydrogen
              bonding; molecular mass does not set dipole strength; geometry and
              vector cancellation determine polarity. Water can donate two and
              accept two hydrogen bonds.
            </p>
            <p>
              Particle flow and tetrahedral fragments are schematic. The network
              illustrates organization rather than a full ice crystal.
            </p>
            <a
              href="https://openstax.org/books/chemistry-2e/pages/10-1-intermolecular-forces"
              target="_blank"
              rel="noreferrer"
            >
              Explore the science · OpenStax Chemistry 2e{" "}
              <ArrowUpRight size={14} />
            </a>
            <button className="guide-done" onClick={() => setHelp(false)}>
              Back to the laboratory <ArrowUpRight size={15} />
            </button>
          </section>
        </div>
      )}
    </div>
  );
}
