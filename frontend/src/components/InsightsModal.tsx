import React, { useEffect } from 'react';
import { Lightbulb, Search, AlertTriangle, Zap } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useInsights } from "../pages/InsightsContext";  // ✅ import context hook

interface InsightsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InsightsModal({ isOpen, onClose }: InsightsModalProps) {
  const { setInsights } = useInsights(); // ✅ get context setter

  // ✅ Fetch insights from backend API
  const { data, isLoading } = useQuery({
    queryKey: ['insights'],
    queryFn: async () => {
      const res = await fetch('http://localhost:8080/insights', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          "selected_text": "Chicken and Mango Salad\nIngredients:\n• 1 cup cooked chicken breast, diced\n• 1/2 mango, diced\n• 1/4 cup red onion, finely chopped\n• 1/4 cup cilantro, chopped\n• 2 tablespoons olive oil\n• 1 tablespoon lime juice\n• Salt and pepper to taste\nInstructions:\n• In a bowl, combine the chicken, mango, red onion, and cilantro.\n• Drizzle with olive oil and lime juice.\n• Season with salt and pepper, then toss to combine.\n\nVeggie and Cheese Quesadilla\nIngredients:\n• 1 whole wheat tortilla\n• 1/2 cup shredded cheese\n• 1/4 cup bell pepper, sliced\n• 1/4 cup zucchini, sliced\n• 1/4 cup red onion, sliced\nInstructions:\n• Lay the tortilla flat and sprinkle half of the cheese on one side.\n• Add the bell pepper, zucchini, and red onion.\n• Sprinkle the remaining cheese on top and fold the tortilla in half.\n• Cook in a skillet over medium heat until the cheese is melted and the tortilla is golden brown.\n• Slice into wedges.", // (shortened for clarity)
          "top_k": 3,
        }),
      });

      if (!res.ok) throw new Error("Failed to fetch insights");
      return res.json();
    },
    enabled: isOpen, // only run when modal opens
  });

  const insights = data?.insights;

  // ✅ Whenever new insights come, push them into global context
  useEffect(() => {
    if (insights) {
      setInsights(insights);
    }
  }, [insights, setInsights]);

  const sections = [
    {
      title: 'Key Insights',
      icon: Lightbulb,
      color: 'text-red-700',
      bgColor: 'bg-gradient-to-r from-red-50 to-pink-50',
      borderColor: 'border-l-red-500',
      iconBg: 'bg-gradient-to-r from-red-100 to-pink-100',
      items: insights?.key_insights || [],
    },
    {
      title: 'Did You Know?',
      icon: Search,
      color: 'text-blue-700',
      bgColor: 'bg-gradient-to-r from-blue-50 to-cyan-50',
      borderColor: 'border-l-blue-500',
      iconBg: 'bg-gradient-to-r from-blue-100 to-cyan-100',
      items: insights?.did_you_know || [],
    },
    {
      title: 'Contradictions & Counterpoints',
      icon: AlertTriangle,
      color: 'text-orange-700',
      bgColor: 'bg-gradient-to-r from-orange-50 to-amber-50',
      borderColor: 'border-l-orange-500',
      iconBg: 'bg-gradient-to-r from-orange-100 to-amber-100',
      items: insights?.contradictions || [],
    },
    {
      title: 'Inspiration / Connections Across Docs',
      icon: Zap,
      color: 'text-purple-700',
      bgColor: 'bg-gradient-to-r from-purple-50 to-indigo-50',
      borderColor: 'border-l-purple-500',
      iconBg: 'bg-gradient-to-r from-purple-100 to-indigo-100',
      items: insights?.inspirations || [],
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center animate-pulse">
              <Lightbulb className="w-5 h-5 text-red-600" />
            </div>
            Document Insights
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-4">
              {sections.map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-5 bg-muted rounded w-3/4"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded"></div>
                      <div className="h-3 bg-muted rounded w-5/6"></div>
                      <div className="h-3 bg-muted rounded w-4/6"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {sections.map((section, index) => (
                <Card key={index} className="h-fit">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <div
                        className={`w-10 h-10 rounded-full ${section.iconBg} flex items-center justify-center shadow-sm`}
                      >
                        <section.icon className={`w-6 h-6 ${section.color}`} />
                      </div>
                      <span className={section.color}>{section.title}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {section.items.length > 0 ? (
                      <ul className="space-y-3">
                        {section.items.map((item: string, idx: number) => (
                          <li
                            key={idx}
                            className={`text-sm text-gray-800 leading-relaxed pl-4 border-l-4 ${section.borderColor} ${section.bgColor} py-3 rounded-r shadow-sm`}
                          >
                            {item}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">
                        No insights available for this section.
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
