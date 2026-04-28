import { useState, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Moon, Sun, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Circle, Square, Triangle } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface Marker {
  string: number;
  fret: number;
  label?: string;
}

interface NutIndicator {
  string: number;
  type: "none" | "open" | "muted";
}

interface Barre {
  fret: number;
  startString: number;
  endString: number;
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
  const [primaryColor, setPrimaryColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [markerShape, setMarkerShape] = useState("circle");
  const [nutIndicators, setNutIndicators] = useState<NutIndicator[]>([]);
  const [barres, setBarres] = useState<Barre[]>([]);
  const [dragStart, setDragStart] = useState<{ fret: number; string: number } | null>(null);
  const [dragEnd, setDragEnd] = useState<{ fret: number; string: number } | null>(null);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
  };

  const toggleNutIndicator = (stringIndex: number) => {
    setNutIndicators((prev) => {
      const existing = prev.find((n) => n.string === stringIndex);
      if (!existing) return [...prev, { string: stringIndex, type: "open" }];
      if (existing.type === "open") {
        return prev.map((n) => (n.string === stringIndex ? { ...n, type: "muted" } : n));
      }
      if (existing.type === "muted") {
        return prev.filter((n) => n.string !== stringIndex);
      }
      return prev;
    });
  };

  const setMarkerLabel = (stringIndex: number, fretIndex: number, label: string) => {
    setMarkers((prev) =>
      prev.map((m) => (m.string === stringIndex && m.fret === fretIndex ? { ...m, label } : m))
    );
  };

  const toggleMarker = (stringIndex: number, fretIndex: number) => {
    // If it's a simple click (no drag), toggle marker
    setMarkers((prev) => {
      const exists = prev.find((m) => m.string === stringIndex && m.fret === fretIndex);
      if (exists) {
        return prev.filter((m) => !(m.string === stringIndex && m.fret === fretIndex));
      }
      return [...prev, { string: stringIndex, fret: fretIndex }];
    });
  };

  const onMouseDown = (stringIndex: number, fretIndex: number) => {
    setDragStart({ string: stringIndex, fret: fretIndex });
    setDragEnd({ string: stringIndex, fret: fretIndex });
  };

  const onMouseEnter = (stringIndex: number, fretIndex: number) => {
    if (dragStart) {
      setDragEnd({ string: stringIndex, fret: fretIndex });
    }
  };

  const onMouseUp = () => {
    if (dragStart && dragEnd && dragStart.fret === dragEnd.fret) {
      if (dragStart.string !== dragEnd.string) {
        // Created a barre
        const fret = dragStart.fret;
        const startString = Math.min(dragStart.string, dragEnd.string);
        const endString = Math.max(dragStart.string, dragEnd.string);
        
        setBarres(prev => {
          // Remove any existing barre on the same fret
          const filtered = prev.filter(b => b.fret !== fret);
          return [...filtered, { fret, startString, endString }];
        });
      } else {
        // Simple click - check if we clicked an existing barre to remove it
        const existingBarre = barres.find(b => b.fret === dragStart.fret && dragStart.string >= b.startString && dragStart.string <= b.endString);
        if (existingBarre) {
          setBarres(prev => prev.filter(b => b !== existingBarre));
        } else {
          toggleMarker(dragStart.string, dragStart.fret);
        }
      }
    }
    setDragStart(null);
    setDragEnd(null);
  };

  const svgWidth = 300;
  const svgHeight = 400;
  const margin = 40;
  const chartWidth = svgWidth - margin * 2;
  const chartHeight = svgHeight - margin * 2;

  const fretDistance = chartHeight / fretCount;
  const stringDistance = chartWidth / (stringCount - 1);

  const editorSvg = useMemo(() => {
    const lines = [];
    
    // Draw strings (vertical)
    for (let i = 0; i < stringCount; i++) {
      const x = margin + i * stringDistance;
      lines.push(
        <line
          key={`string-${i}`}
          x1={x}
          y1={margin}
          x2={x}
          y2={margin + chartHeight}
          stroke={primaryColor}
          strokeWidth={strokeWidth[0]}
        />
      );
    }

    // Draw frets (horizontal)
    for (let i = 0; i <= fretCount; i++) {
      const y = margin + i * fretDistance;
      const isNut = i === 0 && startingFret === 1;
      lines.push(
        <line
          key={`fret-${i}`}
          x1={margin}
          y1={y}
          x2={margin + chartWidth}
          y2={y}
          stroke={primaryColor}
          strokeWidth={isNut ? strokeWidth[0] * 3 : strokeWidth[0]}
        />
      );
    }

    // Nut indicators (X / O)
    const nutElements = [];
    for (let s = 0; s < stringCount; s++) {
      const x = margin + s * stringDistance;
      const y = margin - 15;
      const indicator = nutIndicators.find((n) => n.string === s);
      
      nutElements.push(
        <g 
          key={`nut-${s}`} 
          className="cursor-pointer group" 
          onClick={() => toggleNutIndicator(s)}
        >
          <rect x={x - 10} y={y - 10} width={20} height={20} fill="transparent" />
          {indicator?.type === "open" && (
            <circle cx={x} cy={y} r={6} fill="none" stroke={primaryColor} strokeWidth={strokeWidth[0]} />
          )}
          {indicator?.type === "muted" && (
            <g stroke={primaryColor} strokeWidth={strokeWidth[0]}>
              <line x1={x - 5} y1={y - 5} x2={x + 5} y2={y + 5} />
              <line x1={x + 5} y1={y - 5} x2={x - 5} y2={y + 5} />
            </g>
          )}
          {!indicator && (
            <circle 
              cx={x} 
              cy={y} 
              r={4} 
              fill={primaryColor} 
              fillOpacity="0" 
              className="group-hover:fill-opacity-10 transition-all" 
            />
          )}
        </g>
      );
    }

    // Barres
    const barreElements = [];
    barres.forEach((barre, idx) => {
      const xStart = margin + barre.startString * stringDistance;
      const xEnd = margin + barre.endString * stringDistance;
      const y = margin + (barre.fret - 0.5) * fretDistance;
      const height = (markerSize[0] / 200) * Math.min(stringDistance, fretDistance) * 2;
      
      barreElements.push(
        <rect
          key={`barre-${idx}`}
          x={xStart - height / 2}
          y={y - height / 2}
          width={xEnd - xStart + height}
          height={height}
          rx={height / 2}
          fill={primaryColor}
          className="cursor-pointer"
        />
      );
    });

    // Preview barre while dragging
    if (dragStart && dragEnd && dragStart.fret === dragEnd.fret && dragStart.string !== dragEnd.string) {
      const xStart = margin + Math.min(dragStart.string, dragEnd.string) * stringDistance;
      const xEnd = margin + Math.max(dragStart.string, dragEnd.string) * stringDistance;
      const y = margin + (dragStart.fret - 0.5) * fretDistance;
      const height = (markerSize[0] / 200) * Math.min(stringDistance, fretDistance) * 2;
      
      barreElements.push(
        <rect
          key="barre-preview"
          x={xStart - height / 2}
          y={y - height / 2}
          width={xEnd - xStart + height}
          height={height}
          rx={height / 2}
          fill={primaryColor}
          fillOpacity="0.4"
          style={{ pointerEvents: 'none' }}
        />
      );
    }

    // Hitboxes and Markers
    const interactiveElements = [];
    for (let s = 0; s < stringCount; s++) {
      for (let f = 1; f <= fretCount; f++) {
        const x = margin + s * stringDistance;
        const y = margin + (f - 0.5) * fretDistance;
        const marker = markers.find(m => m.string === s && m.fret === f);
        const radius = (markerSize[0] / 200) * Math.min(stringDistance, fretDistance);
        
        const renderShape = (isGhost = false) => {
          const props = {
            fill: primaryColor,
            fillOpacity: isGhost ? "0.2" : "1",
            className: isGhost ? "opacity-0 group-hover:opacity-100 transition-opacity" : ""
          };

          if (markerShape === "circle") return <circle cx={x} cy={y} r={radius} {...props} />;
          if (markerShape === "square") return <rect x={x - radius} y={y - radius} width={radius * 2} height={radius * 2} {...props} />;
          if (markerShape === "triangle") {
            const p1 = `${x},${y - radius}`;
            const p2 = `${x - radius},${y + radius}`;
            const p3 = `${x + radius},${y + radius}`;
            return <polygon points={`${p1} ${p2} ${p3}`} {...props} />;
          }
          return null;
        };

        interactiveElements.push(
          <g 
            key={`cell-${s}-${f}`} 
            className="cursor-pointer group"
            onMouseDown={() => onMouseDown(s, f)}
            onMouseEnter={() => onMouseEnter(s, f)}
            onMouseUp={onMouseUp}
          >
            <rect
              x={x - stringDistance / 2}
              y={margin + (f - 1) * fretDistance}
              width={stringDistance}
              height={fretDistance}
              fill="transparent"
            />
            
            {!marker && renderShape(true)}
            
            {marker && (
              <Popover>
                <PopoverTrigger asChild>
                  <g className="cursor-pointer">
                    {renderShape()}
                    <text
                      x={x}
                      y={y}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill={bgColor}
                      style={{ fontSize: fontSize[0] * 0.6, fontWeight: 'bold', pointerEvents: 'none' }}
                    >
                      {marker.label}
                    </text>
                  </g>
                </PopoverTrigger>
                <PopoverContent className="w-40 p-2">
                  <div className="flex flex-col gap-2">
                    <Label className="text-xs">Texto do marcador</Label>
                    <div className="flex gap-2">
                      <Input 
                        autoFocus
                        maxLength={2}
                        className="h-8" 
                        value={marker.label || ""} 
                        onChange={(e) => setMarkerLabel(s, f, e.target.value)}
                        placeholder="1..."
                      />
                      <Button size="sm" variant="destructive" onClick={() => toggleMarker(s, f)}>
                        Remover
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </g>
        );
      }
    }

    return (
      <svg 
        viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
        className="w-full h-full max-h-[500px]"
        style={{ backgroundColor: bgColor }}
      >
        {lines}
        {nutElements}
        {barreElements}
        {interactiveElements}
        {chordTitle && (
          <text
            x={svgWidth / 2}
            y={margin / 2}
            textAnchor="middle"
            fill={primaryColor}
            style={{ fontSize: fontSize[0], fontWeight: 'bold' }}
          >
            {chordTitle}
          </text>
        )}
        {startingFret > 1 && (
          <text
            x={margin - 10}
            y={margin + fretDistance / 2}
            textAnchor="end"
            dominantBaseline="middle"
            fill={primaryColor}
            style={{ fontSize: fontSize[0] * 0.8 }}
          >
            {startingFret}fr
          </text>
        )}
      </svg>
    );
  }, [
    chordTitle, 
    startingFret, 
    fretCount, 
    stringCount, 
    markerSize, 
    strokeWidth, 
    fontSize, 
    primaryColor, 
    bgColor, 
    markers,
    markerShape,
    nutIndicators,
    barres,
    dragStart,
    dragEnd,
    stringDistance,
    fretDistance,
    chartWidth,
    chartHeight
  ]);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? "dark bg-background text-foreground" : "bg-slate-50 text-slate-900"}`}>
      <header className="border-b bg-card px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
        <h1 className="text-xl font-bold tracking-tight">Criador de Acordes Moderno</h1>
        <Button variant="outline" size="icon" onClick={toggleDarkMode}>
          {isDarkMode ? <Sun className="h-[1.2rem] w-[1.2rem]" /> : <Moon className="h-[1.2rem] w-[1.2rem]" />}
        </Button>
      </header>

      <main className="container mx-auto p-6 space-y-8">
        {/* Configurações */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">Configurações do Diagrama</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <Label htmlFor="chordTitle">Título do Acorde</Label>
                <Input 
                  id="chordTitle" 
                  value={chordTitle} 
                  onChange={(e) => setChordTitle(e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startingFret">Traste Inicial</Label>
                <Input 
                  id="startingFret" 
                  type="number" 
                  value={startingFret} 
                  onChange={(e) => setStartingFret(parseInt(e.target.value) || 1)} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fretCount">Número de Trastes</Label>
                <Input 
                  id="fretCount" 
                  type="number" 
                  value={fretCount} 
                  onChange={(e) => setFretCount(parseInt(e.target.value) || 5)} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stringCount">Número de Cordas</Label>
                <Input 
                  id="stringCount" 
                  type="number" 
                  value={stringCount} 
                  onChange={(e) => setStringCount(parseInt(e.target.value) || 6)} 
                />
              </div>

              <div className="space-y-2">
                <Label>Formato do Marcador</Label>
                <ToggleGroup type="single" value={markerShape} onValueChange={(val) => val && setMarkerShape(val)} className="justify-start">
                  <ToggleGroupItem value="circle" aria-label="Círculo">
                    <Circle className="h-4 w-4" />
                  </ToggleGroupItem>
                  <ToggleGroupItem value="square" aria-label="Quadrado">
                    <Square className="h-4 w-4" />
                  </ToggleGroupItem>
                  <ToggleGroupItem value="triangle" aria-label="Triângulo">
                    <Triangle className="h-4 w-4" />
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>

              <div className="space-y-4">
                <Label>Tamanho do Marcador ({markerSize}%)</Label>
                <Slider value={markerSize} onValueChange={setMarkerSize} min={10} max={80} step={1} />
              </div>
              <div className="space-y-4">
                <Label>Espessura da Linha ({strokeWidth}px)</Label>
                <Slider value={strokeWidth} onValueChange={setStrokeWidth} min={1} max={10} step={0.5} />
              </div>
              <div className="space-y-4">
                <Label>Tamanho da Fonte ({fontSize}px)</Label>
                <Slider value={fontSize} onValueChange={setFontSize} min={10} max={32} step={1} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Cor Principal</Label>
                  <div className="flex gap-2">
                    <Input 
                      type="color" 
                      value={primaryColor} 
                      onChange={(e) => setPrimaryColor(e.target.value)} 
                      className="h-10 w-full p-1 cursor-pointer"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Cor de Fundo</Label>
                  <Input 
                    type="color" 
                    value={bgColor} 
                    onChange={(e) => setBgColor(e.target.value)} 
                    className="h-10 w-full p-1 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Visualização Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="min-h-[400px] shadow-md flex flex-col">
            <CardHeader className="border-b bg-muted/50 py-3">
              <CardTitle className="text-md">Editor</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex items-center justify-center p-4">
              <div className="w-full max-w-[300px] border rounded-lg overflow-hidden shadow-inner bg-white/50 dark:bg-black/20">
                {editorSvg}
              </div>
            </CardContent>
          </Card>

          <Card className="min-h-[400px] shadow-md flex flex-col">
            <CardHeader className="border-b bg-muted/50 py-3">
              <CardTitle className="text-md">Resultado</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex items-center justify-center p-0">
              <div className="text-muted-foreground animate-pulse">
                SVG do Resultado virá aqui
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ações de Download */}
        <div className="flex flex-wrap justify-center gap-4 py-4">
          <Button size="lg" variant="secondary" className="gap-2">
            <Download className="h-4 w-4" />
            Baixar PNG
          </Button>
          <Button size="lg" className="gap-2">
            <Download className="h-4 w-4" />
            Baixar SVG
          </Button>
        </div>
      </main>
    </div>
  );
}
