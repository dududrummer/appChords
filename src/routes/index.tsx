import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Moon, Sun, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

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

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
  };

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
            <CardContent className="flex-1 flex items-center justify-center p-0">
              <div className="text-muted-foreground animate-pulse">
                SVG do Editor virá aqui
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
