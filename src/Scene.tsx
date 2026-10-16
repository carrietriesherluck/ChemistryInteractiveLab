import {
  Suspense,
  useRef,
  useState,
  useMemo,
  useLayoutEffect,
  Component,
  createContext,
  useContext,
  type RefObject,
  type ReactNode,
} from "react";
import {
  Canvas,
  useFrame,
  useThree,
  type ThreeEvent,
} from "@react-three/fiber";
import { OrbitControls, Line } from "@react-three/drei";
import * as THREE from "three";
import {
  molecules,
  comparisons,
  type Settings,
  type Vec,
  type MoleculeData,
} from "./chemistry";
const AnnotationPortal = createContext<
  RefObject<HTMLDivElement | null> | undefined
>(undefined);
const colors: Record<string, string> = {
  O: "#e66f62",
  H: "#eeeae0",
  N: "#7894d5",
  F: "#a3c799",
  Cl: "#91bd86",
  C: "#657b83",
  B: "#d5ad80",
};
const radii: Record<string, number> = {
  H: 0.25,
  O: 0.43,
  N: 0.42,
  F: 0.4,
  Cl: 0.52,
  C: 0.41,
  B: 0.42,
};
function Label({
  p,
  children,
  tone = "",
  labelRef,
}: {
  p: Vec;
  children: ReactNode;
  tone?: string;
  labelRef?: RefObject<HTMLSpanElement | null>;
}) {
  const portal = useContext(AnnotationPortal),
    group = useRef<THREE.Group>(null),
    element = useRef<HTMLDivElement | null>(null);
  const { camera, size } = useThree();
  const world = useMemo(() => new THREE.Vector3(), []);
  useLayoutEffect(() => {
    const target = portal?.current;
    if (!target) return;
    const outer = document.createElement("div"),
      span = document.createElement("span");
    outer.style.cssText = "position:absolute;top:0;left:0;pointer-events:none;";
    span.className = `scene-label ${tone}`;
    span.textContent = Array.isArray(children)
      ? children.join("")
      : String(children ?? "");
    outer.append(span);
    target.append(outer);
    element.current = outer;
    if (labelRef) labelRef.current = span;
    return () => {
      outer.remove();
      element.current = null;
      if (labelRef) labelRef.current = null;
    };
  }, [portal, tone, children, labelRef]);
  useFrame(() => {
    if (!group.current || !element.current) return;
    group.current.getWorldPosition(world);
    world.project(camera);
    element.current.style.transform = `translate(${(world.x * 0.5 + 0.5) * size.width}px,${(-world.y * 0.5 + 0.5) * size.height}px) translate(-50%,-50%)`;
    element.current.style.visibility = world.z > 1 ? "hidden" : "visible";
    element.current.style.zIndex = String(Math.round((1 - world.z) * 10000));
  });
  return <group ref={group} position={p} />;
}
function Bond({ a, b }: { a: Vec; b: Vec }) {
  const av = new THREE.Vector3(...a),
    bv = new THREE.Vector3(...b),
    d = bv.clone().sub(av);
  const q = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    d.clone().normalize(),
  );
  return (
    <mesh position={av.add(bv).multiplyScalar(0.5)} quaternion={q}>
      <cylinderGeometry args={[0.075, 0.075, d.length(), 12]} />
      <meshStandardMaterial color="#b9c9c7" roughness={0.4} metalness={0.15} />
    </mesh>
  );
}
function Arrow({
  from,
  to,
  color = "#edc578",
}: {
  from: Vec;
  to: Vec;
  color?: string;
}) {
  const a = new THREE.Vector3(...from),
    b = new THREE.Vector3(...to);
  return (
    <primitive
      object={
        new THREE.ArrowHelper(
          b.clone().sub(a).normalize(),
          a,
          b.distanceTo(a),
          color,
          0.18,
          0.1,
        )
      }
    />
  );
}
function Link({ a, b, opacity = 1 }: { a: Vec; b: Vec; opacity?: number }) {
  return (
    <Line
      points={[a, b]}
      color="#96e0c0"
      lineWidth={2}
      dashed
      dashSize={0.12}
      gapSize={0.12}
      transparent
      opacity={opacity}
    />
  );
}
function Molecule({
  id,
  position = [0, 0, 0],
  rotation = 0,
  s,
  role,
  draggable = false,
  onMove,
  onDrag,
}: {
  id: string;
  position?: Vec;
  rotation?: number;
  s: Settings;
  role?: string;
  draggable?: boolean;
  onMove?: (v: Vec) => void;
  onDrag?: (v: boolean) => void;
}) {
  const data = molecules[id],
    g = useRef<THREE.Group>(null),
    drag = useRef<{ plane: THREE.Plane; offset: THREE.Vector3 } | null>(null);
  const desired = useMemo(
    () => new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, rotation)),
    [rotation],
  );
  useFrame((_, dt) => {
    if (g.current) g.current.quaternion.slerp(desired, 1 - Math.exp(-dt * 7));
  });
  const down = (e: ThreeEvent<PointerEvent>) => {
    if (!draggable) return;
    e.stopPropagation();
    onDrag?.(true);
    const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(
      e.camera.getWorldDirection(new THREE.Vector3()),
      new THREE.Vector3(...position),
    );
    drag.current = {
      plane,
      offset: new THREE.Vector3(...position).sub(e.point),
    };
    (e.target as Element).setPointerCapture(e.pointerId);
  };
  const move = (e: ThreeEvent<PointerEvent>) => {
    if (!drag.current) return;
    e.stopPropagation();
    const hit = new THREE.Vector3();
    if (e.ray.intersectPlane(drag.current.plane, hit)) {
      hit.add(drag.current.offset);
      onMove?.([
        THREE.MathUtils.clamp(hit.x, -0.3, 5),
        THREE.MathUtils.clamp(hit.y, -2.8, 2.8),
        THREE.MathUtils.clamp(hit.z, -2, 2),
      ]);
    }
  };
  const up = (e: ThreeEvent<PointerEvent>) => {
    if (drag.current) {
      drag.current = null;
      onDrag?.(false);
      (e.target as Element).releasePointerCapture(e.pointerId);
    }
  };
  return (
    <group
      position={position}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onLostPointerCapture={() => {
        drag.current = null;
        onDrag?.(false);
      }}
    >
      <group ref={g}>
        {data.bonds.map(([a, b], i) => (
          <Bond key={i} a={data.atoms[a].p} b={data.atoms[b].p} />
        ))}
        {data.atoms.map((a, i) => (
          <group key={i} position={a.p}>
            <mesh>
              <sphereGeometry args={[radii[a.element], 32, 24]} />
              <meshStandardMaterial
                color={colors[a.element]}
                roughness={0.28}
                metalness={0.1}
              />
            </mesh>
            {s.labels && (
              <Label p={[0, 0, 0.45]} tone="atom-label">
                {a.element}
              </Label>
            )}
            {s.charges && a.charge && (
              <Label
                p={
                  a.charge === "δ−"
                    ? [-0.64, 0.28, 0]
                    : [0, radii[a.element] + 0.25, 0]
                }
                tone={a.charge === "δ−" ? "negative" : "positive"}
              >
                {a.charge}
              </Label>
            )}
          </group>
        ))}
        {s.lonePairs &&
          s.mode === "hydrogen" &&
          data.acceptor &&
          (id === "ammonia" ? [0] : id === "hf" ? [-1, 0, 1] : [-1, 1]).map(
            (z, i) => (
              <mesh
                key={i}
                position={
                  id === "ammonia"
                    ? [-0.25, -0.35, -0.62]
                    : [-0.47, -0.36, z * 0.53]
                }
                rotation={[0.3, 0, -0.7]}
                scale={[0.22, 0.4, 0.22]}
              >
                <sphereGeometry args={[1, 20, 16]} />
                <meshStandardMaterial
                  color="#b8a6e8"
                  transparent
                  opacity={0.25}
                  depthWrite={false}
                  roughness={0.7}
                />
              </mesh>
            ),
          )}
        {s.bondDipoles &&
          data.bonds.map(([a, b], i) => {
            const pa = data.atoms[a],
              pb = data.atoms[b];
            const positive = pa.charge === "δ−" ? pb : pa,
              negative = pa.charge === "δ−" ? pa : pb;
            if (!negative.charge || negative.charge !== "δ−") return null;
            return (
              <Arrow
                key={i}
                from={[positive.p[0], positive.p[1] + 0.5, positive.p[2] + 0.2]}
                to={[negative.p[0], negative.p[1] + 0.5, negative.p[2] + 0.2]}
              />
            );
          })}
        {s.netDipole && s.mode === "dipole" && data.polar && (
          <Arrow
            from={[-0.7, -1, 0]}
            to={
              id === "water"
                ? [-1.45, -1.97, 0]
                : id === "chcl3"
                  ? [-0.7, -2, 0]
                  : [0.7, -1, 0]
            }
            color="#96e0c0"
          />
        )}
      </group>
      {role && s.highlight && (
        <Label p={[0, -1.3, 0]} tone="role">
          {role}
        </Label>
      )}
    </group>
  );
}
function useTime(playing: boolean) {
  const t = useRef(0);
  useFrame((_, dt) => {
    if (playing) t.current += Math.min(dt, 0.05);
  });
  return t;
}
function Hydrogen({
  s,
  onMove,
  onDrag,
  onStatus,
}: {
  s: Settings;
  onMove?: (v: Vec) => void;
  onDrag?: (b: boolean) => void;
  onStatus?: (v: string) => void;
}) {
  const partner = s.partner === "same" ? s.sample : s.partner;
  // If the first species has no donor, water becomes the donor on the left.
  const swap = !molecules[s.sample].donor && molecules[partner].donor;
  const left = swap ? partner : s.sample,
    right = swap ? s.sample : partner;
  const [offset, setOffset] = useState<Vec>([0, 0, 0]);
  const b: Vec = [s.distance - 1.6 + offset[0], offset[1], offset[2]];
  const theta = ((-52 + s.angle) * Math.PI) / 180;
  const can = molecules[left].donor && molecules[right].acceptor;
  const geometryFavorable =
    Math.abs(s.angle) < 40 && Math.hypot(b[0] + 0.6, b[1], b[2]) < 3.3;
  return (
    <>
      <Molecule
        id={left}
        position={[-1.6, 0, 0]}
        s={s}
        role={molecules[left].donor ? "DONOR" : "NO DONOR"}
      />
      <Molecule
        id={right}
        position={b}
        rotation={theta}
        s={s}
        role="ACCEPTOR"
        draggable
        onDrag={onDrag}
        onMove={(v) => {
          setOffset([v[0] - (s.distance - 1.6), v[1], v[2]]);
          onMove?.(v);
          onStatus?.(
            can &&
              Math.abs(s.angle) < 40 &&
              Math.hypot(v[0] + 0.6, v[1], v[2]) < 3.3
              ? "Favorable donor–H···acceptor"
              : "Separation disrupts the hydrogen bond",
          );
        }}
      />
      {can && geometryFavorable && s.attractions && (
        <Link
          a={[-0.6, 0, 0]}
          b={b}
          opacity={Math.max(0.15, 1 - Math.abs(s.angle) / 40)}
        />
      )}
      {s.network && (
        <>
          <Molecule
            id="water"
            position={[-2.3, 2.7, 0]}
            rotation={Math.PI / 2}
            s={s}
          />
          <Molecule
            id="water"
            position={[-2, -2.8, 0]}
            rotation={Math.atan2(2.8, 0.4)}
            s={s}
          />
          {s.attractions && (
            <>
              <Link a={[-1.85, 0.968, 0]} b={[-2.3, 2.7, 0]} />
              <Link a={[-1.859, -1.81, 0]} b={[-1.6, 0, 0]} />
            </>
          )}
        </>
      )}
    </>
  );
}
function Ion({ s }: { s: Settings }) {
  const count = s.network ? 8 : 1;
  const r = s.distance - 1.3 + s.radius;
  return (
    <>
      <mesh>
        <sphereGeometry args={[s.radius, 40, 32]} />
        <meshStandardMaterial
          color={s.charge > 0 ? "#c6a4ed" : "#dfb376"}
          roughness={0.25}
          metalness={0.18}
        />
      </mesh>
      <Label p={[0, 0, s.radius + 0.1]} tone="ion-label">
        {s.charge > 0 ? "+" : "−"}
        {Math.abs(s.charge)}
      </Label>
      {Array.from({ length: count }, (_, i) => {
        const y = count === 1 ? 0 : 1 - (2 * (i + 0.5)) / count;
        const a = count === 1 ? 0 : i * 2.39996;
        const n = new THREE.Vector3(
          Math.sqrt(1 - y * y) * Math.cos(a),
          y,
          Math.sqrt(1 - y * y) * Math.sin(a),
        );
        return <WaterAround key={i} n={n} r={r} s={s} />;
      })}
    </>
  );
}
function WaterAround({
  n,
  r,
  s,
}: {
  n: THREE.Vector3;
  r: number;
  s: Settings;
}) {
  const g = useRef<THREE.Group>(null);
  const p = n.clone().multiplyScalar(r);
  const hDirection = s.charge > 0 ? n : n.clone().negate();
  const q = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0.612, 0.791, 0),
    hDirection,
  );
  useFrame((_, dt) => g.current?.quaternion.slerp(q, 1 - Math.exp(-dt * 5)));
  return (
    <>
      <group position={p} ref={g}>
        <Molecule id="water" s={{ ...s, netDipole: false }} />
      </group>
      {s.attractions && (
        <Link
          a={n.clone().multiplyScalar(s.radius).toArray() as Vec}
          b={
            (s.charge > 0
              ? p
              : p.clone().add(hDirection.clone().multiplyScalar(0.65))
            ).toArray() as Vec
          }
          opacity={Math.min(0.95, (Math.abs(s.charge) / (r * r)) * 2)}
        />
      )}
    </>
  );
}
function Dipole({ s }: { s: Settings }) {
  const theta = (s.angle * Math.PI) / 180;
  return (
    <>
      <Molecule id={s.sample} position={[-s.distance / 2, 0, 0]} s={s} />
      <Molecule
        id={s.sample}
        position={[s.distance / 2, 0, 0]}
        rotation={theta}
        s={s}
      />
      {s.attractions &&
        molecules[s.sample].polar &&
        s.sample === "hcl" &&
        Math.cos(theta) > 0.35 && (
          <Link
            a={[-s.distance / 2 + 0.65, 0, 0]}
            b={[
              s.distance / 2 - 0.65 * Math.cos(theta),
              -0.65 * Math.sin(theta),
              0,
            ]}
          />
        )}
      {!molecules[s.sample].polar && (
        <Label p={[0, -1.7, 0]}>Σ bond dipoles = 0</Label>
      )}
    </>
  );
}
const hydrocarbon = (branched: boolean): MoleculeData => {
  const cp: Vec[] = branched
    ? [
        [0, 0, 0],
        [1.2, 0.7, 0],
        [2.4, 0, 0],
        [3.6, 0.7, 0],
        [4.8, 0, 0],
        [1.2, 1.8, 0.7],
        [1.2, 0.7, -1.3],
        [3.6, 1.8, 0.7],
      ]
    : Array.from({ length: 8 }, (_, i) => [i * 1.1, (i % 2) * 0.65, 0] as Vec);
  const links: [number, number][] = branched
    ? [
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 4],
        [1, 5],
        [1, 6],
        [3, 7],
      ]
    : Array.from({ length: 7 }, (_, i) => [i, i + 1]);
  const atoms = cp.map((p) => ({
    element: "C",
    p: [p[0] - (branched ? 2.4 : 3.85), p[1] - 0.6, p[2]] as Vec,
  }));
  const degrees = cp.map((_, i) => links.filter((x) => x.includes(i)).length);
  cp.forEach((_, i) => {
    const count = 4 - degrees[i];
    for (let h = 0; h < count; h++) {
      const a = (h * Math.PI * 2) / count;
      const idx = atoms.length;
      atoms.push({
        element: "H",
        p: [
          atoms[i].p[0] + 0.18,
          atoms[i].p[1] + Math.cos(a) * 0.8,
          atoms[i].p[2] + Math.sin(a) * 0.85,
        ],
      });
      links.push([i, idx]);
    }
  });
  return {
    name: branched ? "Isooctane" : "n-Octane",
    formula: "C₈H₁₈",
    atoms,
    bonds: links,
    polar: false,
    donor: false,
    acceptor: false,
    shape: "Hydrocarbon",
  };
};
molecules.octane = hydrocarbon(false);
molecules.isooctane = hydrocarbon(true);
function Dispersion({ s }: { s: Settings }) {
  const t = useTime(s.playing),
    left = useRef<THREE.Group>(null),
    right = useRef<THREE.Group>(null),
    attraction = useRef<THREE.Group>(null),
    sign = useRef<HTMLSpanElement>(null);
  const chain = s.shape !== "compact";
  const spacing = chain ? s.distance * 0.85 : s.distance;
  const phase = useRef(0);
  useFrame(() => {
    const p = t.current % 8;
    const amp = p < 1 ? 0 : Math.sin((p - 1) * 2.2) * 0.32 * s.polarizability;
    phase.current = amp;
    [left, right].forEach((g, i) => {
      if (g.current) {
        const inducedAmp = i && p < 2 ? 0 : amp;
        g.current.position.x =
          (chain ? 0 : i ? spacing / 2 : -spacing / 2) + inducedAmp;
        g.current.scale.set(
          (chain ? 2.6 : 1.2) * s.size + Math.abs(amp) * 0.6,
          chain ? 0.7 : 1.05 * s.size,
          1.05 * s.size,
        );
      }
    });
    if (attraction.current)
      attraction.current.visible = p > 2 && Math.abs(amp) > 0.06;
    if (sign.current)
      sign.current.textContent =
        p < 1
          ? "01 · Symmetric average distribution"
          : p < 2
            ? "02 · An instantaneous dipole forms"
            : amp > 0
              ? "03 · δ+ → δ−     induces     δ+ → δ−"
              : "03 · δ− ← δ+     induces     δ− ← δ+";
  });
  const sample = chain
    ? s.shape === "branched"
      ? "isooctane"
      : "octane"
    : s.sample;
  return (
    <>
      {[0, 1].map((i) => (
        <group
          key={i}
          position={
            chain ? [0, (i - 0.5) * spacing, 0] : [(i - 0.5) * spacing, 0, 0]
          }
          scale={chain ? 0.58 * s.size : s.size}
        >
          <Molecule
            id={sample}
            s={{ ...s, charges: false, netDipole: false }}
          />
        </group>
      ))}
      {s.cloud &&
        [left, right].map((g, i) => (
          <group
            key={i}
            ref={g}
            position={
              chain ? [0, (i - 0.5) * spacing, 0] : [(i - 0.5) * spacing, 0, 0]
            }
          >
            <mesh scale={[1, chain ? 0.5 : 1, 1]}>
              <sphereGeometry args={[1, 40, 24]} />
              <meshStandardMaterial
                color={i ? "#a7a8e9" : "#8cbed7"}
                transparent
                opacity={0.14}
                roughness={0.75}
                depthWrite={false}
              />
            </mesh>
            <mesh scale={[0.92, chain ? 0.44 : 0.92, 0.92]}>
              <sphereGeometry args={[1, 32, 20]} />
              <meshStandardMaterial
                color="#a6b8e7"
                transparent
                opacity={0.09}
                depthWrite={false}
              />
            </mesh>
          </group>
        ))}
      {s.attractions && (
        <group ref={attraction}>
          <Link
            a={chain ? [0, -spacing / 2 + 0.65, 0] : [-spacing / 2 + 0.8, 0, 0]}
            b={chain ? [0, spacing / 2 - 0.65, 0] : [spacing / 2 - 0.8, 0, 0]}
            opacity={0.5}
          />
        </group>
      )}
      <Label p={[0, -2, 0]} tone="cloud-caption" labelRef={sign}>
        Average distribution · symmetric
      </Label>
    </>
  );
}
function Core({
  s,
  onDrag,
  onStatus,
}: {
  s: Settings;
  onDrag?: (v: boolean) => void;
  onStatus?: (v: string) => void;
}) {
  if (s.mode === "hydrogen")
    return <Hydrogen s={s} onDrag={onDrag} onStatus={onStatus} />;
  if (s.mode === "ion") return <Ion s={s} />;
  if (s.mode === "dipole") return <Dipole s={s} />;
  return <Dispersion s={s} />;
}
function Particle({
  i,
  strong,
  temp,
  property,
  playing,
  attractions,
}: {
  i: number;
  strong: boolean;
  temp: number;
  property: string;
  playing: boolean;
  attractions: boolean;
}) {
  const ref = useRef<THREE.Group>(null),
    t = useTime(playing);
  const x = ((i % 7) - 3) * 0.63,
    y = (Math.floor(i / 7) - 2) * 0.57;
  useFrame(() => {
    if (!ref.current) return;
    let px = x,
      py = y;
    const time = t.current * (0.4 + temp * 0.6);
    if (property === "evaporation" || property === "vapor") {
      const cycle = (time * (strong ? 0.35 : 0.7) + i * 0.7) % 8;
      const threshold = (strong ? 6 : 3) - temp;
      const escaping = i % 3 === 0 && cycle > threshold;
      const fraction = (cycle - threshold) / (8 - threshold);
      py = escaping
        ? 1.5 +
          (property === "vapor"
            ? Math.sin(fraction * Math.PI) * 1.2
            : fraction * 2.2)
        : y + Math.sin(time * 2 + i) * 0.09;
      px = x + Math.sin(time + i) * 0.12;
    } else if (property === "viscosity") {
      px = ((x + time * (strong ? 0.28 : 0.8) + 2.4) % 4.8) - 2.4;
      py = y + Math.sin(time + i) * 0.06;
    } else {
      px = x + Math.sin(time + i) * 0.045;
      py = y + Math.cos(time + i) * 0.045;
    }
    ref.current.position.set(px, py, Math.sin(i * 2.4) * 0.25);
  });
  return (
    <group ref={ref} position={[x, y, 0]}>
      <mesh>
        <sphereGeometry args={[0.14, 12, 10]} />
        <meshStandardMaterial
          color={strong ? "#b6d4cb" : "#e6b993"}
          roughness={0.4}
        />
      </mesh>
      {property === "surface" && attractions && i === 31 && (
        <>
          <Arrow from={[0, 0, 0]} to={[0, -0.65, 0]} color="#a1e2c8" />
          <Arrow from={[0, 0, 0]} to={[-0.5, 0, 0]} />
          <Arrow from={[0, 0, 0]} to={[0.5, 0, 0]} />
        </>
      )}
    </group>
  );
}
function Ice({ frozen, s }: { frozen: boolean; s: Settings }) {
  const t = useTime(s.playing),
    g = useRef<THREE.Group>(null);
  useFrame(() => {
    if (g.current && !frozen)
      g.current.rotation.y = Math.sin(t.current * 0.2) * 0.1;
  });
  const directions: Vec[] = [
    [1, 0, 0],
    [-0.25, 0.968, 0],
    [-0.375, -0.484, 0.79],
    [-0.375, -0.484, -0.79],
  ];
  const style = {
    ...s,
    charges: false,
    labels: false,
    lonePairs: false,
    highlight: false,
  };
  return (
    <group ref={g}>
      <Molecule id="water" s={style} />
      {directions.map((n, i) => {
        const direction = new THREE.Vector3(...n).normalize(),
          dist = frozen ? 2.85 : 2.1 + (i % 2) * 0.18,
          p = direction.clone().multiplyScalar(dist);
        const q = new THREE.Quaternion().setFromUnitVectors(
          i < 2
            ? new THREE.Vector3(0.612, 0.791, 0)
            : new THREE.Vector3(1, 0, 0),
          i < 2 ? direction : direction.clone().negate(),
        );
        const a = (
          i < 2
            ? new THREE.Vector3(...molecules.water.atoms[i + 1].p)
            : p.clone().sub(direction)
        ).toArray() as Vec;
        return (
          <group key={i}>
            <group position={p} quaternion={q}>
              <Molecule id="water" s={style} />
            </group>
            {s.attractions && (
              <Link a={a} b={i < 2 ? (p.toArray() as Vec) : [0, 0, 0]} />
            )}
          </group>
        );
      })}
    </group>
  );
}
function Matter({
  property,
  temp,
  s,
}: {
  property: string;
  temp: number;
  s: Settings;
}) {
  return (
    <>
      {[0, 1].map((i) => (
        <group
          key={i}
          position={[(i - 0.5) * 6, 0, 0]}
          scale={property === "ice" ? 0.7 : 1}
        >
          {property === "ice" ? (
            <Ice frozen={!!i} s={s} />
          ) : (
            <>
              <Line
                points={[
                  [-2.4, 2.9, 0],
                  [-2.4, -1.7, 0],
                  [2.4, -1.7, 0],
                  [2.4, 2.9, 0],
                ]}
                color="#617a75"
                lineWidth={1.5}
              />
              {property === "vapor" && (
                <Line
                  points={[
                    [-2.4, 2.9, 0],
                    [2.4, 2.9, 0],
                  ]}
                  color="#617a75"
                />
              )}
              <Line
                points={[
                  [-2.4, 1.45, -0.5],
                  [2.4, 1.45, -0.5],
                ]}
                color="#617a75"
                transparent
                opacity={0.4}
              />
              {Array.from({ length: 35 }, (_, n) => (
                <Particle
                  key={n}
                  i={n}
                  strong={!!i}
                  temp={temp}
                  property={property}
                  playing={s.playing}
                  attractions={s.attractions}
                />
              ))}
            </>
          )}
          <Label p={[0, -2.4, 0]} tone="matter-caption">
            {property === "ice"
              ? i
                ? "ICE · OPEN NETWORK"
                : "LIQUID · CLOSER PACKING"
              : i
                ? "STRONGER COHESION"
                : "WEAKER COHESION"}
          </Label>
        </group>
      ))}
    </>
  );
}
class Boundary extends Component<{ children: ReactNode }, { error: boolean }> {
  state = { error: false };
  static getDerivedStateFromError() {
    return { error: true };
  }
  render() {
    return this.state.error ? (
      <div className="fallback">
        <h3>Explore the chemistry in words</h3>
        <p>
          The 3D workspace needs WebGL. All controls and the live scientific
          explanation remain available below.
        </p>
      </div>
    ) : (
      this.props.children
    );
  }
}
function FitCamera({ view }: { view: string }) {
  const { camera, size } = useThree();
  useLayoutEffect(() => {
    const aspect = size.width / Math.max(1, size.height);
    const distance =
      view === "compare"
        ? Math.max(12, 22 / aspect)
        : view === "matter"
          ? Math.max(12, 18 / aspect)
          : 11;
    camera.position.set(0, distance * 0.155, distance);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [camera, size.width, size.height, view]);
  return null;
}
export default function Scene({
  s,
  view,
  comparison,
  property,
  temp,
  reset,
  onStatus,
}: {
  s: Settings;
  view: string;
  comparison: number;
  property: string;
  temp: number;
  reset: number;
  onStatus?: (v: string) => void;
}) {
  const annotations = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const c = comparisons[comparison];
  return (
    <div className="canvas-shell">
      <div ref={annotations} className="annotation-layer" />
      <AnnotationPortal.Provider value={annotations}>
        <Boundary>
          <Suspense
            fallback={
              <div className="fallback">Preparing the molecular workspace…</div>
            }
          >
            <Canvas
              key={reset}
              dpr={[1, 1.7]}
              camera={{
                position: [0, 1.7, view === "explore" ? 11 : 16],
                fov: 40,
              }}
              gl={{ antialias: true, alpha: true }}
              fallback={
                <div className="fallback">
                  WebGL is unavailable. Read the live explanation and use the
                  accessible controls to explore each mechanism.
                </div>
              }
            >
              <FitCamera view={view} />
              <ambientLight intensity={1.2} />
              <directionalLight position={[4, 7, 6]} intensity={3} />
              <directionalLight
                position={[-6, 2, -3]}
                color="#9cc9bb"
                intensity={2}
              />
              <pointLight
                position={[-3, -2, 5]}
                intensity={12}
                color="#e7c6af"
              />
              <group
                key={`${view}-${s.mode}-${s.sample}-${s.partner}-${reset}`}
              >
                {view === "matter" ? (
                  <Matter property={property} temp={temp} s={s} />
                ) : view === "compare" ? (
                  <>
                    {[0, 1].map((i) => (
                      <group
                        key={i}
                        position={[(i - 0.5) * 6.4, 0, 0]}
                        scale={0.8}
                      >
                        <Core
                          s={{
                            ...c.config(!!i),
                            playing: s.playing,
                            labels: s.labels,
                          }}
                        />
                      </group>
                    ))}
                  </>
                ) : (
                  <Core s={s} onDrag={setDragging} onStatus={onStatus} />
                )}
              </group>
              <gridHelper
                args={[30, 30, "#314a45", "#233c37"]}
                position={[0, -3.4, 0]}
                material-transparent
                material-opacity={0.3}
              />
              <OrbitControls
                makeDefault
                enabled={!dragging}
                enablePan
                minDistance={5}
                maxDistance={25}
                minPolarAngle={0.2}
                maxPolarAngle={Math.PI * 0.85}
                enableDamping
              />
            </Canvas>
          </Suspense>
        </Boundary>
      </AnnotationPortal.Provider>
    </div>
  );
}
