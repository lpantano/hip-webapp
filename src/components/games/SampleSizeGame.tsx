import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { BoxPlot } from "./BoxPlot";
import { Shuffle } from "lucide-react";

// Population demographics
const DEMOGRAPHICS = {
  gender: ["Male", "Female"],
  age: ["18-25", "26-35", "36-45", "46-55", "56-65", "65+"],
  race: ["White", "Black", "Hispanic", "Asian", "Other"],
  country: ["USA", "Canada", "UK", "Germany", "France", "Japan", "Australia"]
};

// Generate a person with random demographics
const generatePerson = () => ({
  id: Math.random(),
  gender: DEMOGRAPHICS.gender[Math.floor(Math.random() * DEMOGRAPHICS.gender.length)],
  age: DEMOGRAPHICS.age[Math.floor(Math.random() * DEMOGRAPHICS.age.length)],
  race: DEMOGRAPHICS.race[Math.floor(Math.random() * DEMOGRAPHICS.race.length)],
  country: DEMOGRAPHICS.country[Math.floor(Math.random() * DEMOGRAPHICS.country.length)],
  // Base running speed with some demographic variation but NO true potato effect
  baseSpeed: 15 + Math.random() * 10 + 
    (Math.random() < 0.5 ? 1 : -1) + // gender variation
    (Math.random() < 0.3 ? 2 : 0) + // age variation
    (Math.random() < 0.2 ? 1.5 : 0) // country variation
});

// Generate population of 10,000 people
const POPULATION = Array.from({ length: 10000 }, generatePerson);

export const SampleSizeGame = () => {
  const [sampleSize, setSampleSize] = useState([50]);
  const [seed, setSeed] = useState(0);

  // Generate samples based on current sample size and seed
  const { groupA, groupB, stats } = useMemo(() => {
    const rng = (seed: number) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };

    const shuffledPop = [...POPULATION].sort(() => rng(seed + Math.random()) - 0.5);
    const size = sampleSize[0];
    
    const groupA = shuffledPop.slice(0, size).map(person => ({
      ...person,
      runningSpeed: person.baseSpeed + (Math.random() - 0.5) * 3, // Random noise
      group: "No Potato"
    }));
    
    const groupB = shuffledPop.slice(size, size * 2).map(person => ({
      ...person,
      runningSpeed: person.baseSpeed + (Math.random() - 0.5) * 3, // Same random noise, NO potato effect
      group: "Ate Potato"
    }));

    const speedsA = groupA.map(p => p.runningSpeed);
    const speedsB = groupB.map(p => p.runningSpeed);
    
    const meanA = speedsA.reduce((a, b) => a + b, 0) / speedsA.length;
    const meanB = speedsB.reduce((a, b) => a + b, 0) / speedsB.length;
    const difference = meanB - meanA;
    
    return {
      groupA,
      groupB,
      stats: {
        meanA: meanA.toFixed(2),
        meanB: meanB.toFixed(2),
        difference: difference.toFixed(2),
        sampleSize: size
      }
    };
  }, [sampleSize, seed]);

  const reshuffle = () => {
    setSeed(prev => prev + 1);
  };

  const getDifferenceColor = (diff: number) => {
    const absDiff = Math.abs(diff);
    if (absDiff < 0.5) return "text-green-600 bg-green-50";
    if (absDiff < 1) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const getInterpretation = (diff: number, size: number) => {
    const absDiff = Math.abs(diff);
    if (size < 100 && absDiff > 1) {
      return "⚠️ Small sample showing large difference - likely a false positive!";
    }
    if (size >= 500 && absDiff < 0.5) {
      return "✅ Large sample showing small difference - this is the true effect (none)!";
    }
    if (size >= 100 && absDiff < 1) {
      return "📊 Moderate sample size revealing the truth - minimal difference";
    }
    return "🎲 Try different sample sizes to see the pattern";
  };

  return (
    <div className="space-y-6">
      {/* Scenario Description */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">🥔 Research Question</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            <strong>Hypothesis:</strong> "Eating potatoes before running makes people run faster"
            <br />
            <strong>Reality:</strong> There is NO true effect - potatoes don't affect running speed. 
            Any differences you see are due to random sampling variation.
            <br />
            <strong>Population:</strong> 10,000 people with natural variation across gender, age, race, and country.
          </p>
        </CardContent>
      </Card>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">🎛️ Experiment Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">
              Sample Size per Group: {sampleSize[0]} people
            </label>
            <Slider
              value={sampleSize}
              onValueChange={setSampleSize}
              max={1000}
              min={10}
              step={10}
              className="mt-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>10 (very small)</span>
              <span>1000 (large)</span>
            </div>
          </div>
          
          <Button onClick={reshuffle} variant="outline" className="w-full">
            <Shuffle className="w-4 h-4 mr-2" />
            Resample Population
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">📊 Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.meanA}</div>
              <div className="text-sm text-muted-foreground">No Potato Group</div>
              <div className="text-xs">Average Speed (km/h)</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.meanB}</div>
              <div className="text-sm text-muted-foreground">Ate Potato Group</div>
              <div className="text-xs">Average Speed (km/h)</div>
            </div>
            
            <div className="text-center">
              <Badge className={`text-lg px-3 py-1 ${getDifferenceColor(parseFloat(stats.difference))}`}>
                {parseFloat(stats.difference) > 0 ? '+' : ''}{stats.difference}
              </Badge>
              <div className="text-sm text-muted-foreground">Difference</div>
              <div className="text-xs">Potato - No Potato</div>
            </div>
          </div>
          
          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm text-center">
              {getInterpretation(parseFloat(stats.difference), parseInt(stats.sampleSize.toString()))}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">📈 Data Visualization</CardTitle>
        </CardHeader>
        <CardContent>
          <BoxPlot groupA={groupA} groupB={groupB} />
        </CardContent>
      </Card>

      {/* Learning Points */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">🎓 Key Learning Points</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li>• <strong>Small samples (10-50):</strong> Often show large, misleading differences due to random variation</li>
            <li>• <strong>Medium samples (100-200):</strong> Start to reveal the truth but can still be misleading</li>
            <li>• <strong>Large samples (500+):</strong> Show the true effect size (close to zero in this case)</li>
            <li>• <strong>Random sampling:</strong> Each resample gives different results, especially with small samples</li>
            <li>• <strong>Statistical significance:</strong> Large differences in small samples might seem "significant" but are often false positives</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};