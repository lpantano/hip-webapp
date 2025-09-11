import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { ResponsiveContainer, Scatter, ScatterChart, XAxis, YAxis, Tooltip, Cell } from "recharts";

interface Person {
  runningSpeed: number;
  group: string;
  gender: string;
  age: string;
  country: string;
}

interface BoxPlotProps {
  groupA: Person[];
  groupB: Person[];
}

export const BoxPlot = ({ groupA, groupB }: BoxPlotProps) => {
  // Prepare data for scatter plot (simulating box plot visualization)
  const scatterData = [
    ...groupA.map((person, index) => ({
      x: 1 + (Math.random() - 0.5) * 0.3, // Add jitter for visibility
      y: person.runningSpeed,
      group: "No Potato",
      person: `${person.gender}, ${person.age}, ${person.country}`,
      speed: person.runningSpeed.toFixed(1)
    })),
    ...groupB.map((person, index) => ({
      x: 2 + (Math.random() - 0.5) * 0.3, // Add jitter for visibility
      y: person.runningSpeed,
      group: "Ate Potato", 
      person: `${person.gender}, ${person.age}, ${person.country}`,
      speed: person.runningSpeed.toFixed(1)
    }))
  ];

  // Calculate statistics for overlay lines
  const statsA = {
    mean: groupA.reduce((sum, p) => sum + p.runningSpeed, 0) / groupA.length,
    values: groupA.map(p => p.runningSpeed).sort((a, b) => a - b)
  };
  
  const statsB = {
    mean: groupB.reduce((sum, p) => sum + p.runningSpeed, 0) / groupB.length,
    values: groupB.map(p => p.runningSpeed).sort((a, b) => a - b)
  };

  const chartConfig = {
    "No Potato": {
      label: "No Potato Group",
      color: "hsl(var(--chart-1))"
    },
    "Ate Potato": {
      label: "Ate Potato Group", 
      color: "hsl(var(--chart-2))"
    }
  };

  return (
    <div className="w-full h-96">
      <ChartContainer config={chartConfig}>
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
            <XAxis 
              type="number" 
              dataKey="x" 
              domain={[0.5, 2.5]}
              ticks={[1, 2]}
              tickFormatter={(value) => value === 1 ? "No Potato" : "Ate Potato"}
            />
            <YAxis 
              type="number" 
              dataKey="y"
              label={{ value: 'Running Speed (km/h)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload[0]) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-background border rounded-lg p-3 shadow-lg">
                      <p className="font-medium">{data.group}</p>
                      <p className="text-sm">Speed: {data.speed} km/h</p>
                      <p className="text-xs text-muted-foreground">{data.person}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Scatter data={scatterData}>
              {scatterData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.group === "No Potato" ? "hsl(var(--chart-1))" : "hsl(var(--chart-2))"}
                  fillOpacity={0.6}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </ChartContainer>
      
      {/* Statistics overlay */}
      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div className="text-center">
          <div className="font-medium text-chart-1">No Potato Group</div>
          <div>Mean: {statsA.mean.toFixed(2)} km/h</div>
          <div>Range: {statsA.values[0].toFixed(1)} - {statsA.values[statsA.values.length-1].toFixed(1)}</div>
        </div>
        <div className="text-center">
          <div className="font-medium text-chart-2">Ate Potato Group</div>
          <div>Mean: {statsB.mean.toFixed(2)} km/h</div>
          <div>Range: {statsB.values[0].toFixed(1)} - {statsB.values[statsB.values.length-1].toFixed(1)}</div>
        </div>
      </div>
    </div>
  );
};