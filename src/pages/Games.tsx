import Header from "@/components/layout/Header";
import { SampleSizeGame } from "@/components/games/SampleSizeGame";

const Games = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-2">Statistical Learning Games</h1>
          <p className="text-lg text-muted-foreground text-center mb-12">
            Interactive games to understand the 4 scoring categories and statistical concepts
          </p>
          
          <div className="grid gap-8">
            <div className="bg-card rounded-lg border p-6">
              <h2 className="text-2xl font-semibold mb-4">Sample Size Game</h2>
              <p className="text-muted-foreground mb-6">
                Explore how sample size affects statistical findings. See how small samples can show false differences 
                that disappear with larger sample sizes.
              </p>
              <SampleSizeGame />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Games;