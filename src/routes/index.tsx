import { useState, useMemo, useRef, useCallback } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Moon, Sun, Download, Circle, Square, Triangle, Trash2, Columns, Rows } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import { ChordSearch } from "@/components/ChordSearch";
import { ProgressionEditor } from "@/components/ProgressionEditor";

interface Marker {
  string: number;
  fret: number;
  label?: string;
  color?: string;
}

interface NutIndicator {
  string: number;
  type: "none" | "open" | "muted";
}

interface Barre {
  fret: number;
  startString: number;
  endString: number;
  label?: string;
  color?: string;
}

export const Route = createFileRoute("/")({
  component: ChordGenerator,
});

function ChordGenerator() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [chordTitle, setChordTitle] = useState("C Major");
  const [startingFret, setStartingFret] = useState(1);
  const [fretCount, setFretCount] = useState(5);
  const [stringCount, setStringCount] = useState(6);
  const [markerSize, setMarkerSize] = useState([40]);
  const [strokeWidth, setStrokeWidth] = useState([2]);
  const [fontSize, setFontSize] = useState([16]);
  const [labelFontSize, setLabelFontSize] = useState([10]);
  const [primaryColor, setPrimaryColor] = useState("#000000");
  const [markerColor, setMarkerColor] = useState("#000000");
  const [markerShape, setMarkerShape] = useState("circle");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [orientation, setOrientation] = useState<"vertical" | "horizontal">("vertical");
  const [taper, setTaper] = useState([10]);
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [nutIndicators, setNutIndicators] = useState<NutIndicator[]>([]);
  const [barres, setBarres] = useState<Barre[]>([]);
  const [stringNames, setStringNames] = useState<string[]>(Array(12).fill(""));
  const [dragStart, setDragStart] = useState<{ fret: number; string: number } | null>(null);
  const [dragEnd, setDragEnd] = useState<{ fret: number; string: number } | null>(null);
  const resultSvgRef = useRef<SVGSVGElement>(null);

  const handleSelectVoicing = useCallback((data: {
    markers: Marker[];
    barres: Barre[];
    nutIndicators: NutIndicator[];
    startingFret: number;
    chordName: string;
  }) => {
    setMarkers(data.markers);
    setBarres(data.barres);
    setNutIndicators(data.nutIndicators);
    setStartingFret(data.startingFret);
    setChordTitle(data.chordName);

    // Ajusta fretCount para mostrar todas as notas da posição
    const pressedFrets = data.markers.map(m => m.fret).filter(f => f > 0);
    if (pressedFrets.length > 0) {
      const maxFret = Math.max(...pressedFrets);
      const minFret = data.startingFret;
      const span = maxFret - minFret + 2; // +2 para margem visual
      setFretCount(prev => Math.max(prev, span));
    }

    toast.success(`Acorde ${data.chordName} carregado!`);
  }, []);

  const handleTuningChange = useCallback((tuning: string[], count: number) => {
    setStringCount(count);
    setStringNames(prev => {
      const next = Array(12).fill("");
      tuning.forEach((n, i) => { next[i] = n; });
      return next;
    });
    setMarkers([]);
    setBarres([]);
    setNutIndicators([]);
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
  };

  const handleStringNameChange = (index: number, name: string) => {
    const newNames = [...stringNames];
    newNames[index] = name.substring(0, 2);
    setStringNames(newNames);
  };

  const updateMarker = (stringIndex: number, fretIndex: number, updates: Partial<Marker>) => {
    setMarkers((prev) =>
      prev.map((m) => (m.string === stringIndex && m.fret === fretIndex ? { ...m, ...updates } : m))
    );
  };

  const updateBarre = (fretIndex: number, updates: Partial<Barre>) => {
    setBarres((prev) =>
      prev.map((b) => (b.fret === fretIndex ? { ...b, ...updates } : b))
    );
  };

  const toggleNutIndicator = (stringIndex: number) => {
    setNutIndicators((prev) => {
      const existing = prev.find((n) => n.string === stringIndex);
      if (!existing) return [...prev, { string: stringIndex, type: "open" }];
      if (existing.type === "open") return prev.map((n) => (n.string === stringIndex ? { ...n, type: "muted" } : n));
      if (existing.type === "muted") return prev.filter((n) => n.string !== stringIndex);
      return prev;
    });
  };

  const removeMarker = (stringIndex: number, fretIndex: number) => {
    setMarkers(prev => prev.filter(m => !(m.string === stringIndex && m.fret === fretIndex)));
  };

  const onMouseDown = (stringIndex: number, fretIndex: number) => {
    setDragStart({ string: stringIndex, fret: fretIndex });
    setDragEnd({ string: stringIndex, fret: fretIndex });
  };

  const onMouseEnter = (stringIndex: number, fretIndex: number) => {
    if (dragStart) setDragEnd({ string: stringIndex, fret: fretIndex });
  };

  const onMouseUp = () => {
    if (dragStart && dragEnd && dragStart.fret === dragEnd.fret) {
      if (dragStart.string !== dragEnd.string) {
        const fret = dragStart.fret;
        const startString = Math.min(dragStart.string, dragEnd.string);
        const endString = Math.max(dragStart.string, dragEnd.string);
        setBarres(prev => {
          const filtered = prev.filter(b => b.fret !== fret);
          return [...filtered, { fret, startString, endString, color: markerColor, label: "" }];
        });
      } else {
        const existingBarre = barres.find(b => b.fret === dragStart.fret && dragStart.string >= b.startString && dragStart.string <= b.endString);
        if (existingBarre) {
          // Do nothing on single click if it's a barre, the Popover will handle it
        } else {
          const exists = markers.find(m => m.string === dragStart.string && m.fret === dragStart.fret);
          if (!exists) {
            setMarkers(prev => [...prev, { string: dragStart.string, fret: dragStart.fret, label: "", color: markerColor }]);
          }
        }
      }
    }
    setDragStart(null);
    setDragEnd(null);
  };

  const isVertical = orientation === "vertical";
  const svgWidth = isVertical ? 300 : 450;
  const svgHeight = isVertical ? 450 : 300;
  const margin = 50;
  const chartWidth = (isVertical ? svgWidth : svgHeight) - margin * 2;
  const chartHeight = (isVertical ? svgHeight : svgWidth) - margin * 2.5;
  const fretDistance = chartHeight / fretCount;
  const stringDistance = chartWidth / (stringCount - 1);
  const taperFactor = taper[0] / 100;

  const getCoords = (s: number, f: number) => {
    const p = f / fretCount; // 0 at top (nut), 1 at bottom
    const scale = (1 - taperFactor / 2) + p * taperFactor;
    const middlePos = margin + (stringCount - 1) * stringDistance / 2;
    const distFromCenter = (s * stringDistance) - ((stringCount - 1) * stringDistance / 2);
    const variablePos = middlePos + distFromCenter * scale;
    const constantPos = margin + f * fretDistance;

    return isVertical 
      ? { x: variablePos, y: constantPos } 
      : { x: constantPos, y: variablePos };
  };

  const getFretboardContent = (isReadOnly: boolean) => {
    const lines = [];
    // Strings
    for (let i = 0; i < stringCount; i++) {
      const p1 = getCoords(i, 0);
      const p2 = getCoords(i, fretCount);
      lines.push(<line key={`string-${i}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={primaryColor} strokeWidth={strokeWidth[0]} />);
    }
    // Frets
    for (let i = 0; i <= fretCount; i++) {
      const p1 = getCoords(0, i);
      const p2 = getCoords(stringCount - 1, i);
      const isNut = i === 0 && startingFret === 1;
      lines.push(<line key={`fret-${i}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={primaryColor} strokeWidth={isNut ? strokeWidth[0] * 3 : strokeWidth[0]} />);
    }

    const nutElements = [];
    for (let s = 0; s < stringCount; s++) {
      const pNut = getCoords(s, 0);
      const indicator = nutIndicators.find((n) => n.string === s);
      const offset = 15;
      const x = isVertical ? pNut.x : pNut.x - offset;
      const y = isVertical ? pNut.y - offset : pNut.y;
      
      nutElements.push(
        <g key={`nut-${s}`} className={isReadOnly ? "" : "cursor-pointer group"} onClick={isReadOnly ? undefined : () => toggleNutIndicator(s)}>
          {!isReadOnly && <rect x={x - 10} y={y - 10} width={20} height={20} fill="transparent" />}
          {indicator?.type === "open" && <circle cx={x} cy={y} r={6} fill="none" stroke={primaryColor} strokeWidth={strokeWidth[0]} />}
          {indicator?.type === "muted" && (
            <g stroke={primaryColor} strokeWidth={strokeWidth[0]}><line x1={x - 5} y1={y - 5} x2={x + 5} y2={y + 5} /><line x1={x + 5} y1={y - 5} x2={x - 5} y2={y + 5} /></g>
          )}
        </g>
      );
    }

    const stringNameElements = [];
    for (let s = 0; s < stringCount; s++) {
      const pEnd = getCoords(s, fretCount);
      const offset = 20;
      const x = isVertical ? pEnd.x : pEnd.x + offset;
      const y = isVertical ? pEnd.y + offset : pEnd.y;
      
      if (stringNames[s]) {
        stringNameElements.push(
          <text key={`name-${s}`} x={x} y={y} textAnchor={isVertical ? "middle" : "start"} dominantBaseline="middle" fill={primaryColor} style={{ fontSize: fontSize[0] * 0.7, fontWeight: 'bold' }}>
            {stringNames[s]}
          </text>
        );
      }
    }

    const barreElements: React.ReactNode[] = [];
    barres.forEach((barre, idx) => {
      const pStart = getCoords(barre.startString, barre.fret - 0.5);
      const pEnd = getCoords(barre.endString, barre.fret - 0.5);
      const thickness = (markerSize[0] / 200) * Math.min(stringDistance, fretDistance) * 2;
      
      const barreColor = barre.color || primaryColor;
      
      const renderBarre = () => {
        if (isVertical) {
          return <rect x={pStart.x - thickness / 2} y={pStart.y - thickness / 2} width={pEnd.x - pStart.x + thickness} height={thickness} rx={thickness / 2} fill={barreColor} />;
        } else {
          return <rect x={pStart.x - thickness / 2} y={pStart.y - thickness / 2} width={thickness} height={pEnd.y - pStart.y + thickness} rx={thickness / 2} fill={barreColor} />;
        }
      };

      if (isReadOnly) {
        barreElements.push(
          <g key={`barre-${idx}`}>
            {renderBarre()}
            <text 
              x={(pStart.x + pEnd.x) / 2} 
              y={(pStart.y + pEnd.y) / 2} 
              textAnchor="middle" 
              dominantBaseline="central" 
              fill={bgColor} 
              style={{ fontSize: labelFontSize[0], fontWeight: 'bold' }}
            >
              {barre.label}
            </text>
          </g>
        );
      } else {
        barreElements.push(
          <Popover key={`barre-${idx}`}>
            <PopoverTrigger asChild>
              <g className="cursor-pointer">
                {renderBarre()}
                <text 
                  x={(pStart.x + pEnd.x) / 2} 
                  y={(pStart.y + pEnd.y) / 2} 
                  textAnchor="middle" 
                  dominantBaseline="central" 
                  fill="white" 
                  style={{ fontSize: labelFontSize[0], fontWeight: 'bold', pointerEvents: 'none' }}
                >
                  {barre.label}
                </text>
              </g>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-3 space-y-4" onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
              <div className="space-y-2">
                <Label className="text-xs">Texto e Cor da Pestana</Label>
                <div className="flex gap-2 mb-2">
                  <Input maxLength={2} className="h-8" value={barre.label || ""} onChange={(e) => updateBarre(barre.fret, { label: e.target.value })} onKeyDown={(e) => e.stopPropagation()} placeholder="1, T..." />
                  <Input type="color" className="h-8 w-12 p-1 cursor-pointer" value={barreColor} onChange={(e) => updateBarre(barre.fret, { color: e.target.value })} onKeyDown={(e) => e.stopPropagation()} />
                </div>
                <div className="flex flex-wrap gap-1">
                  {["#000000", "#3b82f6", "#22c55e", "#f97316", "#eab308", "#a855f7"].map((c) => (
                    <button
                      key={c}
                      className="w-5 h-5 rounded-full border border-border transition-transform hover:scale-110"
                      style={{ backgroundColor: c }}
                      onClick={() => updateBarre(barre.fret, { color: c })}
                    />
                  ))}
                </div>
              </div>
              <Button variant="destructive" size="sm" className="w-full gap-2" onClick={() => setBarres(prev => prev.filter(b => b.fret !== barre.fret))}>
                <Trash2 className="h-4 w-4" /> Remover Pestana
              </Button>
            </PopoverContent>
          </Popover>
        );
      }
    });

    const interactiveElements = [];
    for (let s = 0; s < stringCount; s++) {
      for (let f = 1; f <= fretCount; f++) {
        const p = getCoords(s, f - 0.5);
        const { x, y } = p;
        const marker = markers.find(m => m.string === s && m.fret === f);
        const radius = (markerSize[0] / 200) * Math.min(stringDistance, fretDistance);
        
        const renderShape = (isGhost = false, color = markerColor) => {
          const props = { fill: color, fillOpacity: isGhost ? "0.2" : "1", className: isGhost ? "opacity-0 group-hover:opacity-100 transition-opacity" : "" };
          if (markerShape === "circle") return <circle cx={x} cy={y} r={radius} {...props} />;
          if (markerShape === "square") return <rect x={x - radius} y={y - radius} width={radius * 2} height={radius * 2} {...props} />;
          if (markerShape === "triangle") {
            const points = isVertical 
              ? `${x},${y - radius} ${x - radius},${y + radius} ${x + radius},${y + radius}`
              : `${x + radius},${y} ${x - radius},${y - radius} ${x - radius},${y + radius}`;
            return <polygon points={points} {...props} />;
          }
          return null;
        };

        if (isReadOnly) {
          if (marker) {
            interactiveElements.push(
              <g key={`cell-${s}-${f}`}>
                {renderShape(false, marker.color || markerColor)}
                <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fill={bgColor} style={{ fontSize: labelFontSize[0], fontWeight: 'bold' }}>{marker.label}</text>
              </g>
            );
          }
          continue;
        }

        const p1 = getCoords(s, f-1);
        const hitWidth = isVertical ? stringDistance : fretDistance;
        const hitHeight = isVertical ? fretDistance : stringDistance;
        const hitX = isVertical ? x - stringDistance / 2 : p1.x;
        const hitY = isVertical ? p1.y : y - stringDistance / 2;

        interactiveElements.push(
          <g key={`cell-${s}-${f}`} onMouseDown={() => onMouseDown(s, f)} onMouseEnter={() => onMouseEnter(s, f)} onMouseUp={onMouseUp}>
            <rect x={hitX} y={hitY} width={hitWidth} height={hitHeight} fill="transparent" className="cursor-pointer" />
            {!marker && renderShape(true)}
            {marker && (
              <Popover>
                <PopoverTrigger asChild>
                  <g className="cursor-pointer">
                    {renderShape(false, marker.color || markerColor)}
                    <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fill="white" style={{ fontSize: labelFontSize[0], fontWeight: 'bold', pointerEvents: 'none' }}>{marker.label}</text>
                  </g>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-3 space-y-4" onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
                  <div className="space-y-2">
                    <Label className="text-xs">Texto e Cor</Label>
                    <div className="flex gap-2 mb-2">
                      <Input maxLength={2} className="h-8" value={marker.label || ""} onChange={(e) => updateMarker(s, f, { label: e.target.value })} onKeyDown={(e) => e.stopPropagation()} placeholder="1, T..." />
                      <Input type="color" className="h-8 w-12 p-1 cursor-pointer" value={marker.color || markerColor} onChange={(e) => updateMarker(s, f, { color: e.target.value })} onKeyDown={(e) => e.stopPropagation()} />
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {["#000000", "#3b82f6", "#22c55e", "#f97316", "#eab308", "#a855f7"].map((c) => (
                        <button
                          key={c}
                          className="w-5 h-5 rounded-full border border-border transition-transform hover:scale-110"
                          style={{ backgroundColor: c }}
                          onClick={() => updateMarker(s, f, { color: c })}
                        />
                      ))}
                    </div>
                  </div>
                  <Button variant="destructive" size="sm" className="w-full gap-2" onClick={() => removeMarker(s, f)}><Trash2 className="h-4 w-4" /> Remover Nota</Button>
                </PopoverContent>
              </Popover>
            )}
          </g>
        );
      }
    }
    return { lines, nutElements, barreElements, interactiveElements, stringNameElements };
  };

  const editorSvg = useMemo(() => {
    const { lines, nutElements, barreElements, interactiveElements, stringNameElements } = getFretboardContent(false);
    const startFretPos = getCoords(0, 0.5);
    const fretLabelX = isVertical ? margin - 15 : startFretPos.x;
    const fretLabelY = isVertical ? startFretPos.y : margin - 15;
    
    return (
      <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full" style={{ backgroundColor: bgColor }}>
        <text x={svgWidth / 2} y={isVertical ? margin / 2 : 25} textAnchor="middle" fill={primaryColor} style={{ fontSize: fontSize[0], fontWeight: 'bold' }}>{chordTitle}</text>
        {lines}{nutElements}{barreElements}{interactiveElements}{stringNameElements}
        {startingFret > 1 && (
          <text x={fretLabelX} y={fretLabelY} textAnchor={isVertical ? "end" : "middle"} dominantBaseline={isVertical ? "middle" : "auto"} fill={primaryColor} style={{ fontSize: fontSize[0] * 0.8 }}>
            {startingFret}ª
          </text>
        )}
      </svg>
    );
  }, [chordTitle, startingFret, fretCount, stringCount, markerSize, strokeWidth, fontSize, primaryColor, markerColor, bgColor, markers, markerShape, nutIndicators, barres, dragStart, dragEnd, stringDistance, fretDistance, stringNames, orientation, taper]);

  const exportSvg = useMemo(() => {
    const { lines, nutElements, barreElements, interactiveElements, stringNameElements } = getFretboardContent(true);
    const startFretPos = getCoords(0, 0.5);
    const fretLabelX = isVertical ? margin - 15 : startFretPos.x;
    const fretLabelY = isVertical ? startFretPos.y : margin - 15;

    return (
      <svg ref={resultSvgRef} viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full" xmlns="http://www.w3.org/2000/svg" style={{ backgroundColor: bgColor }}>
        <rect width="100%" height="100%" fill={bgColor} />
        <text x={svgWidth / 2} y={isVertical ? margin / 2 : 25} textAnchor="middle" fill={primaryColor} style={{ fontSize: fontSize[0], fontWeight: 'bold' }}>{chordTitle}</text>
        {lines}{nutElements}{barreElements}{interactiveElements}{stringNameElements}
        {startingFret > 1 && (
          <text x={fretLabelX} y={fretLabelY} textAnchor={isVertical ? "end" : "middle"} dominantBaseline={isVertical ? "middle" : "auto"} fill={primaryColor} style={{ fontSize: fontSize[0] * 0.8 }}>
            {startingFret}ª
          </text>
        )}
      </svg>
    );
  }, [chordTitle, startingFret, fretCount, stringCount, markerSize, strokeWidth, fontSize, primaryColor, markerColor, bgColor, markers, markerShape, nutIndicators, barres, stringNames, orientation, taper]);

  const downloadFilename = (chordTitle || "chord").toLowerCase().replace(/[^a-z0-9]/g, "-");

  return (
    <div className={`min-h-screen ${isDarkMode ? "dark bg-background text-foreground" : "bg-slate-50"}`}>
      <header className="border-b bg-card px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
        <h1 className="text-xl font-bold">Criador de Acordes Moderno</h1>
        <Button variant="outline" size="icon" onClick={toggleDarkMode}>{isDarkMode ? <Sun /> : <Moon />}</Button>
      </header>

      <main className="container mx-auto p-6 space-y-8">
        <ChordSearch
          stringCount={stringCount}
          stringNames={stringNames}
          markerColor={markerColor}
          primaryColor={primaryColor}
          bgColor={bgColor}
          markerShape={markerShape}
          markerSize={markerSize}
          onSelectVoicing={handleSelectVoicing}
          onTuningChange={handleTuningChange}
        />
        <ProgressionEditor
          instrument="violao"
          stringCount={stringCount}
          stringNames={stringNames}
          markerColor={markerColor}
          primaryColor={primaryColor}
        />
        <Card>
          <CardHeader><CardTitle className="text-lg">Configurações</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2"><Label>Título</Label><Input value={chordTitle} onChange={(e) => setChordTitle(e.target.value)} /></div>
              <div className="space-y-2"><Label>Traste Inicial</Label><Input type="number" value={startingFret} onChange={(e) => setStartingFret(Number(e.target.value))} /></div>
              <div className="space-y-2"><Label>Trastes</Label><Input type="number" value={fretCount} onChange={(e) => setFretCount(Number(e.target.value))} /></div>
              <div className="space-y-2"><Label>Cordas</Label><Input type="number" value={stringCount} onChange={(e) => setStringCount(Number(e.target.value))} /></div>
              
              <div className="space-y-2">
                <Label>Orientação do Diagrama</Label>
                <ToggleGroup type="single" value={orientation} onValueChange={(v) => v && setOrientation(v as any)} className="justify-start border p-1 rounded-md w-fit">
                  <ToggleGroupItem value="vertical" className="px-3 gap-2" title="Vertical">
                    <Rows className="h-4 w-4" /> <span>Vertical</span>
                  </ToggleGroupItem>
                  <ToggleGroupItem value="horizontal" className="px-3 gap-2" title="Horizontal">
                    <Columns className="h-4 w-4" /> <span>Horizontal</span>
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
              <div className="space-y-4">
                <Label>Conicidade ({taper}%)</Label>
                <Slider value={taper} onValueChange={setTaper} min={0} max={30} step={1} />
              </div>
              <div className="space-y-4"><Label>Tamanho Nota ({markerSize}%)</Label><Slider value={markerSize} onValueChange={setMarkerSize} min={10} max={80} /></div>
              <div className="space-y-4"><Label>Linha ({strokeWidth}px)</Label><Slider value={strokeWidth} onValueChange={setStrokeWidth} min={1} max={10} step={0.5} /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label>Forma</Label>
                <ToggleGroup type="single" value={markerShape} onValueChange={(v) => v && setMarkerShape(v)} className="justify-start">
                  <ToggleGroupItem value="circle"><Circle /></ToggleGroupItem><ToggleGroupItem value="square"><Square /></ToggleGroupItem><ToggleGroupItem value="triangle"><Triangle /></ToggleGroupItem>
                </ToggleGroup>
              </div>
              <div className="space-y-4">
                <Label>Tamanho Fonte ({fontSize}px)</Label>
                <Slider value={fontSize} onValueChange={setFontSize} min={8} max={36} step={1} />
              </div>
              <div className="space-y-4">
                <Label>Fonte no Marcador ({labelFontSize}px)</Label>
                <Slider value={labelFontSize} onValueChange={setLabelFontSize} min={6} max={24} step={1} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label>Cor Principal</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full h-10 p-1">
                        <div className="w-full h-full rounded-sm border" style={{ backgroundColor: primaryColor }} />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-2">
                      <div className="grid grid-cols-3 gap-2">
                        {["#000000", "#3b82f6", "#22c55e", "#a855f7", "#f97316", "#eab308"].map((c) => (
                          <button
                            key={c}
                            className={`w-10 h-10 rounded-full border-2 transition-transform hover:scale-110 ${primaryColor === c ? "border-primary" : "border-transparent"}`}
                            style={{ backgroundColor: c }}
                            onClick={() => setPrimaryColor(c)}
                          />
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Cor Forma</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full h-10 p-1">
                        <div className="w-full h-full rounded-sm border" style={{ backgroundColor: markerColor }} />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-2">
                      <div className="grid grid-cols-3 gap-2">
                        {["#000000", "#3b82f6", "#22c55e", "#a855f7", "#f97316", "#eab308"].map((c) => (
                          <button
                            key={c}
                            className={`w-10 h-10 rounded-full border-2 transition-transform hover:scale-110 ${markerColor === c ? "border-primary" : "border-transparent"}`}
                            style={{ backgroundColor: c }}
                            onClick={() => setMarkerColor(c)}
                          />
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Cor Fundo</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full h-10 p-1">
                        <div className="w-full h-full rounded-sm border" style={{ backgroundColor: bgColor }} />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-2">
                      <div className="grid grid-cols-3 gap-2">
                        {["#ffffff", "#f8fafc", "#f1f5f9", "#e2e8f0", "#000000", "#1a1a1a"].map((c) => (
                          <button
                            key={c}
                            className={`w-10 h-10 rounded-full border-2 transition-transform hover:scale-110 ${bgColor === c ? "border-primary" : "border-transparent"}`}
                            style={{ backgroundColor: c }}
                            onClick={() => setBgColor(c)}
                          />
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Nomes das Cordas ({isVertical ? "Abaixo" : "À direita"})</Label>
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: stringCount }).map((_, i) => (
                  <Input key={i} className="w-12 h-8 text-center" placeholder={`S${i+1}`} value={stringNames[i] || ""} onChange={(e) => handleStringNameChange(i, e.target.value)} />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <Card className="w-full max-w-2xl">
            <CardHeader className="bg-muted/50">
              <CardTitle>Diagrama</CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex justify-center">
              <div className={`w-full ${isVertical ? "max-w-[350px]" : "max-w-[500px]"} border rounded-lg bg-white/50 dark:bg-black/20`}>
                {editorSvg}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="hidden">
          {exportSvg}
        </div>

        <div className="flex justify-center gap-4 py-4">
          <Button variant="secondary" onClick={() => {
            if (!resultSvgRef.current) return;
            const svgData = new XMLSerializer().serializeToString(resultSvgRef.current);
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            const img = new Image();
            canvas.width = svgWidth * 2; canvas.height = svgHeight * 2;
            img.onload = () => {
              if (!ctx) return;
              ctx.fillStyle = bgColor; ctx.fillRect(0, 0, canvas.width, canvas.height);
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
              const link = document.createElement("a"); link.download = `${downloadFilename}.png`; link.href = canvas.toDataURL(); link.click();
            };
            img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
          }}><Download className="mr-2 h-4 w-4" /> PNG</Button>
          <Button onClick={() => {
            if (!resultSvgRef.current) return;
            const svgData = new XMLSerializer().serializeToString(resultSvgRef.current);
            const link = document.createElement("a"); link.download = `${downloadFilename}.svg`;
            link.href = URL.createObjectURL(new Blob([svgData], { type: "image/svg+xml" })); link.click();
          }}><Download className="mr-2 h-4 w-4" /> SVG</Button>
        </div>
      </main>
    </div>
  );
}

export default ChordGenerator;
