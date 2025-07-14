import { Button } from "@/components/ui/button";
import Prompt from "@/components/Prompt";
import { Textarea } from "@/components/ui/textarea";
import Sidebar from "@/components/Sidebar";

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Sidebar />
      <main className="mt-40 flex flex-col items-center justify-center">
        <div className="text-2xl font-bold text-center">
          What do you want to build
        </div>
        <div className="text-sm text-muted-foreground text-center pt-3">
          Prompt, click generate and watch your app come to life
        </div>
        <div className="w-full max-w-xl pt-4">
          <Prompt />
        </div>
      </main>
    </div>
  );
}
