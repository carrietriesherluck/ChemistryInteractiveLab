import { useState, useEffect, useRef } from "react";
import {
  ArrowUpRight,
  Atom,
  ChevronRight,
  FlaskConical,
  Layers3,
  Maximize2,
  Pause,
  Play,
  RotateCcw,
  SlidersHorizontal,
  X,
  BookOpen,
  MoveUpRight,
  Check,
  Info,
} from "lucide-react";
import Scene from "./Scene";
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
        <span>{label}</span>
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
      <span>{label}</span>
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
      <span>{label}</span>
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
    [predict, setPredict] = useState(false),
    [reveal, setReveal] = useState(false),
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
    setPredict(false);
    setReveal(false);
    setReset((v) => v + 1);
  };
  const restart = () => {
    setDragStatus(null);
    setS(defaults(s.mode));
    setTemp(0.5);
    setReset((r) => r + 1);
    setReveal(false);
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
              { id: "explore", name: "The laboratory" },
              { id: "compare", name: "Compare forces" },
              { id: "matter", name: "Molecules → matter" },
            ] as const
          ).map((v) => (
            <button
              key={v.id}
              className={view === v.id ? "active" : ""}
              onClick={() => {
                setView(v.id);
                setPredict(false);
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
          <div>
            <div className="eyebrow">
              <span /> AN INTERACTIVE CHEMISTRY LABORATORY
            </div>
            <h1>
              {view === "explore"
                ? active.question
                : view === "compare"
                  ? "What makes an attraction stronger?"
                  : "Small interactions. Observable effects."}
            </h1>
            <p>
              {view === "explore"
                ? active.subtitle
                : view === "compare"
                  ? "Two systems. One changed variable. A clearer picture."
                  : "Connect the motion of molecules to the properties you can see."}
            </p>
          </div>
          <div className="unit">
            <span>AP CHEMISTRY</span>
            <strong>Unit 03</strong>
            <small>Properties of substances & mixtures</small>
          </div>
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
                <span className="scene-top-muted">
                  {view === "explore" && s.mode === "hydrogen"
                    ? "Hydrogen-bond exploration"
                    : view === "explore"
                      ? active.name
                      : view === "compare"
                        ? comparisons[comparison].name
                        : properties[property].name}
                </span>
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
                  <i className="oxygen" />{" "}
                  {s.mode === "ion"
                    ? "Ion"
                    : s.mode === "dispersion"
                      ? "N / O"
                      : s.mode === "dipole" && s.sample === "hcl"
                        ? "Chlorine"
                        : "Oxygen / N / F"}
                </span>
                <span>
                  <i className="hydrogen" /> Hydrogen
                </span>
                <span>
                  <i className="dashes" /> Attraction
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
                <span>{s.playing ? "LIVE" : "PAUSED"}</span>
              </div>
            </div>
            <div className="scene-instruction">
              <MoveUpRight size={13} /> Drag the background to orbit · Scroll to
              zoom
              {view === "explore" && s.mode === "hydrogen"
                ? " · Drag the right molecule to move it"
                : ""}
            </div>
          </div>
          <aside className="controls">
            <div className="panel-heading">
              <SlidersHorizontal size={16} />
              <span>Experiment controls</span>
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
                    <span>CHANGED VARIABLE</span>
                    <strong>{comparisons[comparison].changed}</strong>
                    <span>HELD CONSTANT</span>
                    <p>{comparisons[comparison].controlled}</p>
                  </div>
                  <p className="control-note">
                    A and B share one camera. Rotate to inspect the same
                    geometry from both sides.
                  </p>
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
                  <p className="control-note">
                    {property === "ice"
                      ? "Compare a closer-packed liquid fragment with an open tetrahedral ice fragment."
                      : "Both systems have the same temperature and particle count. Cohesion differs between them."}
                  </p>
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
                        ? "Ion–water surface gap"
                        : "Molecular separation"
                    }
                    value={s.distance}
                    min={s.mode === "hydrogen" ? 2.6 : 2.7}
                    max={5.5}
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
                  <div className="layer-heading">
                    <Layers3 size={14} /> VISIBLE LAYERS
                  </div>
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
                        onChange={() => update("bondDipoles", !s.bondDipoles)}
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
                </>
              )}
              <div className="model-note">
                <Info size={13} />
                <span>
                  Conceptual model. Distances, motion, and cloud distortions are
                  illustrative.
                </span>
              </div>
            </div>
          </aside>
        </section>
        <section className="insight" aria-live="polite">
          <div className="insight-symbol">
            <FlaskConical size={23} />
          </div>
          <div className="insight-content">
            <div className="eyebrow">WHAT YOU’RE SEEING</div>
            <h2>{info.title}</h2>
            <p>{info.body}</p>
            <details key={view + s.mode + property}>
              <summary>
                Look a little closer <ChevronRight size={13} />
              </summary>
              <p>{info.detail}</p>
            </details>
          </div>
          <div className="observation">
            <span className="eyebrow">CURRENT OBSERVATION</span>
            <p>
              <span className="observation-dot" />
              {view === "explore" && s.mode === "hydrogen" && dragStatus
                ? dragStatus
                : info.status}
            </p>
          </div>
        </section>
        <div className="explore-strip">
          <div>
            <span className="eyebrow">FOLLOW YOUR CURIOSITY</span>
            <h3>A different perspective changes everything.</h3>
          </div>
          <button
            onClick={() => {
              setView("compare");
              setReset((r) => r + 1);
            }}
          >
            <span>01 / SIDE BY SIDE</span>Compare an interaction{" "}
            <ArrowUpRight size={19} />
          </button>
          <button
            onClick={() => {
              setView("matter");
              setReset((r) => r + 1);
            }}
          >
            <span>02 / THE BIGGER PICTURE</span>From molecules to matter{" "}
            <ArrowUpRight size={19} />
          </button>
        </div>
        {view === "explore" && (
          <div className="prediction">
            <button
              onClick={() => {
                setPredict(!predict);
                setReveal(false);
              }}
            >
              <span>✧</span> Pause for a prediction <ChevronRight size={15} />
            </button>
            {predict && (
              <div>
                <p>
                  {s.mode === "ion"
                    ? "If you reverse the ion’s charge, which end of water will turn inward?"
                    : s.mode === "dipole"
                      ? "What will happen when the second molecule turns by 180°?"
                      : s.mode === "dispersion"
                        ? "Can two nonpolar molecules attract without permanent dipoles?"
                        : "Can dimethyl ether accept a hydrogen bond from water?"}
                </p>
                <button className="reveal" onClick={() => setReveal(true)}>
                  {reveal ? <Check size={15} /> : <Play size={13} />}{" "}
                  {reveal ? "Mechanism revealed" : "Reveal the mechanism"}
                </button>
                {reveal && (
                  <p className="answer">
                    {s.mode === "ion"
                      ? "Oxygen faces a positive ion; the hydrogen side faces a negative ion. Try switching the central ion."
                      : s.mode === "dipole"
                        ? "For HCl in this arrangement, favorable unlike ends become unfavorable like ends. For BF₃ and CO₂, the net dipole remains zero."
                        : s.mode === "dispersion"
                          ? "Yes. Correlated temporary electron imbalances give rise to dispersion, even when the average distribution is symmetric."
                          : "Yes. Water supplies an O–H donor, and ether supplies an oxygen lone-pair acceptor. Only the donor needs an O–H bond."}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </main>
      <footer>
        <span>
          INTERMOLECULAR<span className="brand-dot">.</span>
        </span>
        <p>Make the invisible visible.</p>
        <button onClick={() => setHelp(true)}>
          Science & model notes <ArrowUpRight size={13} />
        </button>
      </footer>
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
              Electron clouds show density imbalances, not electron orbits.
              Dispersion coexists with other attractions. No force category is
              universally strongest.
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
