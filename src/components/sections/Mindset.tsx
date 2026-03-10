export function Mindset() {
  return (
    <section id="mindset" className="py-24 md:py-32">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl font-bold mb-4">Mindset</h2>
        <p className="text-muted max-w-2xl mb-12 text-lg">
          Work is better when you stay curious, stay humble, and stay healthy.
        </p>

        {/* Image collage placeholder — replace with real images */}
        <div className="grid grid-cols-3 gap-4 mb-12">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="aspect-square rounded-2xl bg-gray-100 flex items-center justify-center text-muted text-sm font-mono"
              aria-label={`Lifestyle image placeholder ${i}`}
            >
              {i === 1 && "outdoors"}
              {i === 2 && "reading"}
              {i === 3 && "building"}
            </div>
          ))}
        </div>

        <blockquote className="border-l-4 border-accent pl-6 max-w-2xl">
          <p className="text-xl font-medium leading-relaxed mb-3">
            &ldquo;The best engineers I know are also the most curious people I
            know. They read widely, question assumptions, and never stop
            learning.&rdquo;
          </p>
          <cite className="text-sm text-muted font-mono not-italic">
            — A mentor, circa 2020
          </cite>
        </blockquote>
      </div>
    </section>
  );
}
