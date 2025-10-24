import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Star, CheckCircle2, AlertCircle, Save, Code, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface TestingFeedbackPanelProps {
  game: any;
  onClose: () => void;
  onEditCode: () => void;
}

const TestingFeedbackPanel = ({ game, onClose, onEditCode }: TestingFeedbackPanelProps) => {
  const { toast } = useToast();
  const [startTime] = useState(Date.now());
  const [rating, setRating] = useState(0);
  const [testerName, setTesterName] = useState("");
  const [checklist, setChecklist] = useState({
    loads_correctly: false,
    buttons_work: false,
    gameplay_works: false,
    no_visual_glitches: false,
  });
  const [feedback, setFeedback] = useState("");
  const [bugs, setBugs] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!game) return;

    setSaving(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const testDuration = Math.floor((Date.now() - startTime) / 1000);

      const { error } = await supabase
        .from("game_testing_feedback")
        .insert({
          game_id: game.id,
          game_name: game.name,
          component_name: game.component_name,
          tester_id: userData.user?.id,
          tester_email: testerName || userData.user?.email,
          ...checklist,
          feedback_text: feedback || null,
          bugs_found: bugs || null,
          rating: rating || null,
          test_duration_seconds: testDuration,
        });

      if (error) throw error;

      // Log admin action
      await supabase.from("admin_actions").insert({
        action_type: "game_tested",
        target_table: "game_testing_feedback",
        target_id: game.id,
        description: `Tested game: ${game.name} - Rating: ${rating}/5`,
        admin_user_id: userData.user?.id,
      });

      toast({
        title: "Feedback Saved!",
        description: "Your testing feedback has been recorded",
      });

      // Reset form
      setRating(0);
      setChecklist({
        loads_correctly: false,
        buttons_work: false,
        gameplay_works: false,
        no_visual_glitches: false,
      });
      setFeedback("");
      setBugs("");
    } catch (error) {
      console.error("Error saving feedback:", error);
      toast({
        title: "Error",
        description: "Failed to save feedback",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const completedChecks = Object.values(checklist).filter(Boolean).length;
  const totalChecks = Object.keys(checklist).length;
  const progressPercentage = (completedChecks / totalChecks) * 100;

  return (
    <div className="w-[400px] border-l border-slate-800 flex flex-col bg-slate-950 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900">
        <h3 className="font-semibold text-slate-200 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-green-400" />
          Testing Panel
        </h3>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-slate-400 hover:text-white"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Tester Name */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-slate-200">Your Name</CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Optional - helps identify feedback
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              value={testerName}
              onChange={(e) => setTesterName(e.target.value)}
              placeholder="Enter your name..."
              className="bg-slate-900 border-slate-700 text-slate-200 text-sm"
            />
          </CardContent>
        </Card>

        {/* Progress */}
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Progress</span>
                <span className="text-slate-300 font-semibold">
                  {completedChecks}/{totalChecks}
                </span>
              </div>
              <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Testing Checklist */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-slate-200">Testing Checklist</CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Check off each item as you test
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="loads"
                checked={checklist.loads_correctly}
                onCheckedChange={(checked) =>
                  setChecklist({ ...checklist, loads_correctly: checked as boolean })
                }
              />
              <label
                htmlFor="loads"
                className="text-xs text-slate-300 cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Game loads and displays correctly
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="buttons"
                checked={checklist.buttons_work}
                onCheckedChange={(checked) =>
                  setChecklist({ ...checklist, buttons_work: checked as boolean })
                }
              />
              <label
                htmlFor="buttons"
                className="text-xs text-slate-300 cursor-pointer leading-none"
              >
                All buttons respond properly
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="gameplay"
                checked={checklist.gameplay_works}
                onCheckedChange={(checked) =>
                  setChecklist({ ...checklist, gameplay_works: checked as boolean })
                }
              />
              <label
                htmlFor="gameplay"
                className="text-xs text-slate-300 cursor-pointer leading-none"
              >
                Gameplay mechanics work correctly
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="glitches"
                checked={checklist.no_visual_glitches}
                onCheckedChange={(checked) =>
                  setChecklist({ ...checklist, no_visual_glitches: checked as boolean })
                }
              />
              <label
                htmlFor="glitches"
                className="text-xs text-slate-300 cursor-pointer leading-none"
              >
                No visual glitches or bugs
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Rating */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-slate-200">Overall Rating</CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Rate your experience
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-6 w-6 ${
                      star <= rating
                        ? "fill-yellow-500 text-yellow-500"
                        : "text-slate-600 hover:text-yellow-500"
                    }`}
                  />
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Feedback */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-slate-200">General Feedback</CardTitle>
            <CardDescription className="text-xs text-slate-400">
              What worked well? What could be improved?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Share your thoughts about the game..."
              className="bg-slate-900 border-slate-700 text-slate-200 text-xs min-h-[80px]"
            />
          </CardContent>
        </Card>

        {/* Bugs */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-slate-200 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-400" />
              Bugs Found
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Report any issues or errors
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={bugs}
              onChange={(e) => setBugs(e.target.value)}
              placeholder="Describe any bugs or problems..."
              className="bg-slate-900 border-slate-700 text-slate-200 text-xs min-h-[80px]"
            />
          </CardContent>
        </Card>

        {completedChecks === totalChecks && (
          <Alert className="bg-green-500/10 border-green-500/50">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-xs text-slate-300">
              All checklist items completed! Ready to save feedback.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-slate-800 space-y-2 bg-slate-900">
        <Button
          className="w-full bg-green-600 hover:bg-green-700"
          onClick={handleSubmit}
          disabled={saving}
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Saving..." : "Save Feedback"}
        </Button>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            className="bg-blue-600/10 border-blue-500 text-blue-400 text-xs"
            onClick={onEditCode}
          >
            <Code className="h-3 w-3 mr-1" />
            Edit Code
          </Button>
          <Button
            variant="outline"
            className="bg-slate-800 border-slate-700 text-slate-300 text-xs"
            onClick={() => {
              const currentGame = game;
              onClose();
              setTimeout(() => {
                if (currentGame) {
                  window.location.reload();
                }
              }, 100);
            }}
          >
            🔄 Reload
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TestingFeedbackPanel;
