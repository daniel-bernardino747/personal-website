import { Code2, Lightbulb, Rocket } from "lucide-react";
import { Card } from "@/components/ui/Card";

const features = [
  {
    icon: Code2,
    heading: "Clean Architecture",
    body: "I write code that's easy to read, easy to change, and easy to delete. Simplicity is a feature.",
  },
  {
    icon: Lightbulb,
    heading: "Product Thinking",
    body: "Good engineering solves real problems. I stay close to the product and user needs throughout development.",
  },
  {
    icon: Rocket,
    heading: "Ship Fast, Learn Fast",
    body: "I bias toward action. Small iterations, real feedback, continuous improvement — that's how great products are built.",
  },
];

export function About() {
  return (
    <section id="about" className="py-24 md:py-32">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl font-bold mb-4">About</h2>
        <p className="text-muted max-w-2xl mb-12 text-lg">
          I&apos;m a fullstack developer who loves building things that are both
          useful and beautiful. Here&apos;s what drives my work.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Card key={feature.heading}>
              <feature.icon
                size={24}
                strokeWidth={2}
                className="text-accent mb-4"
                aria-hidden="true"
              />
              <h3 className="font-semibold text-lg mb-2">{feature.heading}</h3>
              <p className="text-muted text-sm leading-relaxed">{feature.body}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
