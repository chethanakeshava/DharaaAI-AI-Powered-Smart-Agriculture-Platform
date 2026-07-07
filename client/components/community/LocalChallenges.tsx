import { useApp } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function LocalChallenges() {
  const { feedback } = useApp();
  const feedbackList = feedback || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recent Challenges</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {feedbackList.length === 0 && (
            <p className="text-sm text-muted-foreground">No recent reports</p>
          )}
          {feedbackList.slice(0, 5).map((f) => (
            <div key={f.id} className="border-b border-border pb-3 last:border-b-0">
              <div className="font-semibold text-foreground">{f.title}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {f.tags.length > 0 ? f.tags.join(", ") : "general"}
              </div>
              {f.location && (
                <div className="text-xs text-muted-foreground">
                  📍 {f.location}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
