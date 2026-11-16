import Link from "next/link";
import { templateMeta } from "@/templates/meta";

/** Cards for every template, each opening its live preview with sample data. */
export default function TemplateGallery() {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {templateMeta.map((template) => {
        const [background, surface, accent] = template.swatch;
        return (
          <li key={template.slug}>
            <Link
              href={`/templates/${template.slug}`}
              className="group block overflow-hidden rounded-xl border border-neutral-200 bg-white transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {/* A tiny abstract page in the template's colours. */}
              <div className="flex h-36 items-center justify-center p-5" style={{ background }} aria-hidden>
                <div className="h-full w-3/4 rounded-md p-3 shadow-sm" style={{ background: surface }}>
                  <div className="h-2.5 w-1/2 rounded-full" style={{ background: accent }} />
                  <div className="mt-2 h-1.5 w-3/4 rounded-full opacity-40" style={{ background: accent }} />
                  <div className="mt-4 space-y-1.5">
                    {[90, 75, 82, 60].map((width) => (
                      <div
                        key={width}
                        className="h-1.5 rounded-full opacity-20"
                        style={{ width: `${width}%`, background: background === surface ? accent : background }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="border-t border-neutral-100 p-4">
                <p className="font-medium text-neutral-900">{template.name}</p>
                <p className="mt-0.5 text-sm text-neutral-500">{template.description}</p>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
