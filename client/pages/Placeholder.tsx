import { Link, useLocation } from "react-router-dom";

export default function Placeholder() {
  const { pathname } = useLocation();
  const title = pathname
    .replace(/\//g, " ")
    .trim()
    .split(" ")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ") || "Home";
  return (
    <section className="container py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl md:text-4xl font-bold font-display tracking-tight">
          {title}
        </h1>
        <p className="mt-4 text-foreground/70">
          This page is ready to be designed next. Tell me what you want here and
          I will build it to match your vision exactly.
        </p>
        <div className="mt-8">
          <Link className="text-primary underline underline-offset-4" to="/">
            Back to Home
          </Link>
        </div>
      </div>
    </section>
  );
}
