import { useState, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Moon, Sun, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface Marker {
  string: number;
  fret: number;
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

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
  };

  const toggleMarker = (stringIndex: number, fretIndex: number) => {
    setMarkers((prev) => {
      const exists = prev.find((m) => m.string === stringIndex && m.fret === fretIndex);
      if (exists) {
        return prev.filter((m) => !(m.string === stringIndex && m.fret === fretIndex));
      }
      return [...prev, { string: stringIndex, fret: fretIndex }];
    });
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

    // Hitboxes and Markers
    const interactiveElements = [];
    for (let s = 0; s < stringCount; s++) {
      for (let f = 1; f <= fretCount; f++) {
        const x = margin + s * stringDistance;
        const y = margin + (f - 0.5) * fretDistance;
        const markerExists = markers.find(m => m.string === s && m.fret === f);
        
        interactiveElements.push(
          <g key={`cell-${s}-${f}`} className="cursor-pointer group" onClick={() => toggleMarker(s, f)}>
            {/* Hitbox */}
            <rect
              x={x - stringDistance / 2}
              y={margin + (f - 1) * fretDistance}
              width={stringDistance}
              height={fretDistance}
              fill="transparent"
            />
            {/* Ghost marker (hover) */}
            {!markerExists && (
              <circle
                cx={x}
                cy={y}
                r={(markerSize[0] / 200) * Math.min(stringDistance, fretDistance)}
                fill={primaryColor}
                fillOpacity="0.2"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              />
            )}
            {/* Active marker */}
            {markerExists && (
              <circle
                cx={x}
                cy={y}
                r={(markerSize[0] / 200) * Math.min(stringDistance, fretDistance)}
                fill={primaryColor}
              />
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
