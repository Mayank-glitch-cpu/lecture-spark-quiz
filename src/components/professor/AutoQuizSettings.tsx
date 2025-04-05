import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Clock, Timer } from "lucide-react";
import { useApp } from "@/contexts/AppContext";

/**
 * Format milliseconds to a readable time format (MM:SS)
 */
function formatTimeRemaining(ms: number): string {
  if (!ms) return "00:00";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export default function AutoQuizSettings() {
  const { 
    autoQuizEnabled, 
    setAutoQuizEnabled, 
    quizIntervalMinutes, 
    setQuizIntervalMinutes,
    timeUntilNextQuiz,
    generateQuizFromTranscript
  } = useApp();
  
  const [sliderValue, setSliderValue] = useState(quizIntervalMinutes);
  
  // Handle saving the interval when changed
  const handleIntervalChange = async () => {
    await setQuizIntervalMinutes(sliderValue);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium flex items-center">
          <Timer className="h-4 w-4 mr-2" />
          Automatic Quiz Generation
        </CardTitle>
        <CardDescription>
          Configure how quizzes are automatically generated from lecture content
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="auto-quiz-toggle" className="flex items-center gap-2">
            Enable automatic quizzes
          </Label>
          <Switch 
            id="auto-quiz-toggle" 
            checked={autoQuizEnabled}
            onCheckedChange={setAutoQuizEnabled}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="interval-slider">
              Generation interval: <span className="text-primary font-medium">{sliderValue} minutes</span>
            </Label>
            {autoQuizEnabled && timeUntilNextQuiz && (
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="h-3 w-3 mr-1" />
                Next quiz in: {formatTimeRemaining(timeUntilNextQuiz)}
              </div>
            )}
          </div>
          
          <Slider 
            id="interval-slider"
            disabled={!autoQuizEnabled}
            value={[sliderValue]}
            min={1}
            max={30}
            step={1}
            onValueChange={([value]) => setSliderValue(value)}
            onValueCommit={handleIntervalChange}
            aria-label="Quiz interval in minutes"
          />
        </div>
        
        <div className="pt-2">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={generateQuizFromTranscript}
          >
            Generate Question Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}