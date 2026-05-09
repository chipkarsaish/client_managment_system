import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Network, User, Info, Share2 } from "lucide-react";
import api from "../api/api";

// Layout constants
const NW = 160, NH = 65, CG = 24, SG = 48, VG = 100;

function FamilyTree() {
    const [persons, setPersons] = useState([]);
    const [allRelations, setAllRelations] = useState([]);
    const [selectedPersonId, setSelectedPersonId] = useState("");
    const [svgData, setSvgData] = useState(null);
    const [highlightId, setHighlightId] = useState(null);
    const [selectedName, setSelectedName] = useState("");
    const [stats, setStats] = useState({ total: 0, spouse: 0, children: 0, parents: 0, siblings: 0 });
    const [isGenerating, setIsGenerating] = useState(false);
    const [pan, setPan] = useState({ x: 40, y: 40 });
    const [zoom, setZoom] = useState(0.9);
    const isPanning = useRef(false);
    const lastMouse = useRef({ x: 0, y: 0 });
    const location = useLocation();

    useEffect(() => { fetchData(); }, []);

    // Auto-generate tree if navigated from global search
    useEffect(() => {
        const autoId = location.state?.autoPersonId;
        if (autoId && persons.length > 0 && allRelations.length > 0) {
            setSelectedPersonId(String(autoId));
            // trigger generation after state is set
            setTimeout(() => {
                const pid = parseInt(autoId);
                const person = persons.find(p => p.id === pid);
                if (!person) return;
                const ancestorId = findAncestor(pid, allRelations);
                const tree = buildTree(ancestorId, allRelations);
                if (!tree) return;
                const nodes = [], edges = [];
                assignPos(tree, 0, 0, nodes, edges, pid);
                const maxX = Math.max(...nodes.map(n => n.x + NW)) + 60;
                const maxY = Math.max(...nodes.map(n => n.y + NH)) + 60;
                setSvgData({ nodes, edges, svgWidth: maxX, svgHeight: maxY });
                setHighlightId(pid);
                setSelectedName(`${person.firstName} ${person.lastName}`);
                setPan({ x: 40, y: 40 });
                setZoom(0.9);
                const d = allRelations.filter(r => r.person?.id === pid);
                const s = { total: 0, spouse: 0, children: 0, parents: 0, siblings: 0 };
                d.forEach(r => {
                    s.total++;
                    if (r.relationType === 'Husband' || r.relationType === 'Wife') s.spouse++;
                    if (r.relationType === 'Son' || r.relationType === 'Daughter') s.children++;
                    if (r.relationType === 'Father' || r.relationType === 'Mother') s.parents++;
                    if (r.relationType === 'Brother' || r.relationType === 'Sister') s.siblings++;
                });
                setStats(s);
            }, 0);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.state, persons, allRelations]);

    const fetchData = async () => {
        try {
            const [pRes, rRes] = await Promise.all([api.get("/persons"), api.get("/family")]);
            setPersons(pRes.data);
            setAllRelations(rRes.data);
        } catch (e) { console.error(e); }
    };

    // Trace up via Father/Mother links to find oldest ancestor
    const findAncestor = (personId, rels, seen = new Set()) => {
        if (seen.has(personId)) return personId;
        seen.add(personId);
        const p = rels.find(r => r.person?.id === personId &&
            (r.relationType === 'Father' || r.relationType === 'Mother') && r.relatedPerson);
        return p ? findAncestor(p.relatedPerson.id, rels, seen) : personId;
    };

    // Build tree structure: { person, spouse, children[] }
    const buildTree = (personId, rels, visited = new Set()) => {
        if (visited.has(personId)) return null;
        visited.add(personId);
        const person = persons.find(p => p.id === personId);
        if (!person) return null;

        const spouseRel = rels.find(r =>
            r.person?.id === personId &&
            (r.relationType === 'Husband' || r.relationType === 'Wife') &&
            r.relatedPerson && !visited.has(r.relatedPerson.id));
        const spouse = spouseRel?.relatedPerson || null;
        if (spouse) visited.add(spouse.id);

        const childRels = rels.filter(r =>
            r.person?.id === personId &&
            (r.relationType === 'Son' || r.relationType === 'Daughter') &&
            r.relatedPerson && !visited.has(r.relatedPerson.id));

        const children = childRels
            .map(r => buildTree(r.relatedPerson.id, rels, new Set(visited)))
            .filter(Boolean);

        return { person, spouse, children };
    };

    // Pass 1: calculate total width of a subtree
    const calcWidth = (unit) => {
        if (!unit) return 0;
        const coupleW = unit.spouse ? NW * 2 + CG : NW;
        const childCount = unit.children.length;
        if (childCount === 0) return coupleW;
        const childrenW = unit.children.reduce((s, c) => s + calcWidth(c), 0) + SG * (childCount - 1);
        return Math.max(coupleW, childrenW);
    };

    // Pass 2: assign positions
    const assignPos = (unit, startX, depth, nodes, edges, targetId) => {
        if (!unit) return;
        const totalW = calcWidth(unit);
        const coupleW = unit.spouse ? NW * 2 + CG : NW;
        const coupleLeft = startX + (totalW - coupleW) / 2;
        const y = depth * (NH + VG);

        nodes.push({ id: unit.person.id, x: coupleLeft, y, person: unit.person, isHighlighted: unit.person.id === targetId });

        let midX = coupleLeft + NW / 2;
        if (unit.spouse) {
            const sx = coupleLeft + NW + CG;
            nodes.push({ id: unit.spouse.id, x: sx, y, person: unit.spouse, isHighlighted: unit.spouse.id === targetId });
            // couple line
            edges.push({ x1: coupleLeft + NW, y1: y + NH / 2, x2: sx, y2: y + NH / 2, couple: true });
            midX = coupleLeft + NW + CG / 2;
        }

        if (unit.children.length === 0) return;

        const childrenW = unit.children.reduce((s, c) => s + calcWidth(c), 0) + SG * (unit.children.length - 1);
        let cx = startX + (totalW - childrenW) / 2;
        const midY = y + NH + VG / 2;
        const childY = (depth + 1) * (NH + VG);

        // vertical down from couple mid
        edges.push({ x1: midX, y1: y + NH, x2: midX, y2: midY });

        // collect child center X values
        const childCenters = [];
        unit.children.forEach(child => {
            const cw = calcWidth(child);
            const childCoupleW = child.spouse ? NW * 2 + CG : NW;
            const childCoupleLeft = cx + (cw - childCoupleW) / 2;
            childCenters.push(childCoupleLeft + (child.spouse ? NW + CG / 2 : NW / 2));
            cx += cw + SG;
        });

        // horizontal bar across children
        if (childCenters.length > 1) {
            edges.push({ x1: childCenters[0], y1: midY, x2: childCenters[childCenters.length - 1], y2: midY });
        } else {
            edges.push({ x1: midX, y1: midY, x2: childCenters[0], y2: midY });
        }

        // vertical drop to each child
        childCenters.forEach(ccx => edges.push({ x1: ccx, y1: midY, x2: ccx, y2: childY }));

        // recurse
        let rx = startX + (totalW - childrenW) / 2;
        unit.children.forEach(child => {
            assignPos(child, rx, depth + 1, nodes, edges, targetId);
            rx += calcWidth(child) + SG;
        });
    };

    const handleGenerate = () => {
        if (!selectedPersonId) return;
        setIsGenerating(true);
        setTimeout(() => {
            const pid = parseInt(selectedPersonId);
            const person = persons.find(p => p.id === pid);
            if (!person) { setIsGenerating(false); return; }

            const ancestorId = findAncestor(pid, allRelations);
            const tree = buildTree(ancestorId, allRelations);
            if (!tree) { setIsGenerating(false); return; }

            const nodes = [], edges = [];
            assignPos(tree, 0, 0, nodes, edges, pid);

            const maxX = Math.max(...nodes.map(n => n.x + NW)) + 60;
            const maxY = Math.max(...nodes.map(n => n.y + NH)) + 60;
            setSvgData({ nodes, edges, svgWidth: maxX, svgHeight: maxY });
            setHighlightId(pid);
            setSelectedName(`${person.firstName} ${person.lastName}`);
            setPan({ x: 40, y: 40 });
            setZoom(0.9);

            const d = allRelations.filter(r => r.person?.id === pid);
            const s = { total: 0, spouse: 0, children: 0, parents: 0, siblings: 0 };
            d.forEach(r => {
                s.total++;
                if (r.relationType === 'Husband' || r.relationType === 'Wife') s.spouse++;
                if (r.relationType === 'Son' || r.relationType === 'Daughter') s.children++;
                if (r.relationType === 'Father' || r.relationType === 'Mother') s.parents++;
                if (r.relationType === 'Brother' || r.relationType === 'Sister') s.siblings++;
            });
            setStats(s);
            setIsGenerating(false);
        }, 300);
    };

    const onMouseDown = e => { isPanning.current = true; lastMouse.current = { x: e.clientX, y: e.clientY }; };
    const onMouseMove = e => {
        if (!isPanning.current) return;
        setPan(p => ({ x: p.x + e.clientX - lastMouse.current.x, y: p.y + e.clientY - lastMouse.current.y }));
        lastMouse.current = { x: e.clientX, y: e.clientY };
    };
    const onMouseUp = () => { isPanning.current = false; };
    const onWheel = e => { e.preventDefault(); setZoom(z => Math.min(2.5, Math.max(0.2, z - e.deltaY * 0.001))); };

    const Node = ({ node }) => {
        const { x, y, person, isHighlighted } = node;
        const initials = `${person.firstName?.charAt(0) || ''}${person.lastName?.charAt(0) || ''}`;
        return (
            <g transform={`translate(${x},${y})`}>
                {isHighlighted && <rect width={NW + 10} height={NH + 10} x={-5} y={-5} rx={15} fill="none" stroke="#fbbf24" strokeWidth={4} opacity={0.5} />}
                <rect width={NW} height={NH} rx={11}
                    fill="var(--bg-node)"
                    stroke={isHighlighted ? '#fbbf24' : 'var(--stroke-node)'}
                    strokeWidth={isHighlighted ? 2 : 1}
                    style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))' }} />
                <circle r={17} cx={26} cy={NH / 2} fill={isHighlighted ? 'rgba(245, 158, 11, 0.15)' : 'var(--bg-light-faint-hover)'} />
                <text x={26} y={NH / 2 + 5} textAnchor="middle"
                    fill={isHighlighted ? '#fbbf24' : 'var(--text-secondary)'}
                    fontSize={11} fontWeight={700} fontFamily="system-ui">{initials}</text>
                {isHighlighted && <text x={26} y={13} textAnchor="middle" fill="#fbbf24" fontSize={10} fontFamily="system-ui">★</text>}
                <text x={52} y={NH / 2 - 5} fill="var(--text-primary)" fontSize={13} fontWeight={600} fontFamily="system-ui">{person.firstName}</text>
                <text x={52} y={NH / 2 + 11} fill="var(--text-secondary)" fontSize={12} fontFamily="system-ui">{person.lastName}</text>
            </g>
        );
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '20px' }}>
            {/* Header */}
            <div style={{ backgroundColor: 'var(--bg-surface)', padding: '20px 24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '14px', borderRadius: '12px' }}>
                    <Network size={26} style={{ color: 'var(--primary)' }} />
                </div>
                <div>
                    <h2 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--text-primary)' }}>Family Tree Visualization</h2>
                    <p style={{ margin: '3px 0 0', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        Couples displayed side-by-side · Children on the next row · Selected person highlighted in gold
                    </p>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '20px', flex: 1, minHeight: '600px' }}>
                {/* Canvas */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Selector */}
                    <div className="card" style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', padding: '16px 20px' }}>
                        <div style={{ flex: 1 }}>
                            <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>Select Person to Highlight</label>
                            <div style={{ position: 'relative' }}>
                                <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <select className="form-control" style={{ paddingLeft: '38px', width: '100%' }}
                                    value={selectedPersonId} onChange={e => setSelectedPersonId(e.target.value)}>
                                    <option value="" disabled>Choose a person...</option>
                                    {persons.map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName} (#{p.id})</option>)}
                                </select>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="btn btn-outline" style={{ height: '40px', padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                onClick={() => setZoom(z => Math.min(2.5, z + 0.15))}>+</button>
                            <button className="btn btn-outline" style={{ height: '40px', padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                onClick={() => setZoom(z => Math.max(0.2, z - 0.15))}>−</button>
                            <button className="btn btn-outline" style={{ height: '40px', padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                onClick={() => { setPan({ x: 40, y: 40 }); setZoom(0.9); }}>↺</button>
                            <button className="btn btn-primary" style={{ height: '40px', padding: '0 24px' }}
                                onClick={handleGenerate} disabled={!selectedPersonId || isGenerating}>
                                {isGenerating ? 'Building...' : 'Generate Tree'}
                            </button>
                        </div>
                    </div>

                    {/* SVG Canvas */}
                    <div className="card" style={{ flex: 1, padding: 0, overflow: 'hidden', backgroundColor: 'rgba(5, 8, 17, 0.2)', position: 'relative', cursor: isPanning.current ? 'grabbing' : 'grab' }}
                        onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
                        onWheel={onWheel}>
                        {svgData ? (
                            <svg width="100%" height="100%" style={{ display: 'block' }}>
                                <g transform={`translate(${pan.x},${pan.y}) scale(${zoom})`}>
                                    {/* Edges */}
                                    {svgData.edges.map((e, i) => (
                                        <line key={i} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
                                            stroke={e.couple ? '#f472b6' : '#cbd5e1'}
                                            strokeWidth={e.couple ? 2.5 : 1.5}
                                            strokeDasharray={e.couple ? '6,3' : undefined} />
                                    ))}
                                    {/* Nodes */}
                                    {svgData.nodes.map(node => <Node key={node.id} node={node} />)}
                                </g>
                            </svg>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>
                                <Share2 size={56} style={{ color: '#cbd5e1', marginBottom: '16px' }} />
                                <h3 style={{ margin: '0 0 8px', color: 'var(--text-primary)' }}>No Tree Generated</h3>
                                <p style={{ margin: 0, fontSize: '0.875rem' }}>Select a person above to visualize their family hierarchy.</p>
                            </div>
                        )}

                        {/* Legend */}
                        {svgData && (
                            <div style={{ position: 'absolute', bottom: '16px', left: '16px', backgroundColor: 'rgba(13, 20, 38, 0.85)', backdropFilter: 'blur(10px)', padding: '10px 14px', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.35)', border: '1px solid var(--border)', fontSize: '0.78rem' }}>
                                <div style={{ fontWeight: 700, marginBottom: '6px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.68rem', letterSpacing: '0.05em' }}>Legend</div>
                                {[
                                    { color: '#f59e0b', label: '★ Selected Person' },
                                    { color: '#f472b6', label: '— — Couple Link' },
                                    { color: '#cbd5e1', label: '—— Parent-Child' },
                                ].map(({ color, label }) => (
                                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                        <div style={{ width: '12px', height: '3px', backgroundColor: color, borderRadius: '2px' }} />
                                        <span style={{ color: 'var(--text-primary)' }}>{label}</span>
                                    </div>
                                ))}
                                <div style={{ marginTop: '6px', color: 'var(--text-muted)', fontSize: '0.7rem' }}>Scroll to zoom · Drag to pan</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Summary Panel */}
                <div className="card" style={{ width: '280px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.05rem', borderBottom: '1px solid var(--border)', paddingBottom: '14px' }}>Selected Person</h3>
                    {svgData && highlightId ? (
                        <div>
                            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                                <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'rgba(245, 158, 11, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', fontSize: '1.3rem', fontWeight: 700, color: '#fbbf24', border: '3px solid #fbbf24' }}>
                                    {selectedName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                </div>
                                <h4 style={{ margin: 0, fontSize: '1rem' }}>{selectedName}</h4>
                                <p style={{ margin: '4px 0 0', color: '#f59e0b', fontSize: '0.78rem', fontWeight: 700 }}>★ Highlighted in Tree</p>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {[
                                    { label: 'Total Relations', value: stats.total, bg: 'var(--bg-light-faint)', color: 'var(--text-secondary)' },
                                    { label: 'Husband / Wife', value: stats.spouse, bg: 'rgba(219, 39, 119, 0.12)', color: '#f472b6' },
                                    { label: 'Children', value: stats.children, bg: 'rgba(22, 163, 74, 0.12)', color: '#4ade80' },
                                    { label: 'Parents', value: stats.parents, bg: 'rgba(217, 119, 6, 0.12)', color: '#fbbf24' },
                                    { label: 'Siblings', value: stats.siblings, bg: 'rgba(79, 70, 229, 0.12)', color: '#818cf8' },
                                ].map(({ label, value, bg, color }) => (
                                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 12px', backgroundColor: bg, borderRadius: '8px', color }}>
                                        <span style={{ fontSize: '0.85rem' }}>{label}</span>
                                        <span style={{ fontWeight: 700 }}>{value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px 0' }}>
                            <Info size={28} style={{ color: '#cbd5e1', margin: '0 auto 10px', display: 'block' }} />
                            <p style={{ margin: 0, fontSize: '0.85rem' }}>Generate a tree to see details here.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default FamilyTree;
