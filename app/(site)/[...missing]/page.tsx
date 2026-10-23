import { notFound } from "next/navigation";

// With two root layouts there is no app-wide layout for Next's default 404,
// so unmatched URLs land here and 404 inside the site layout instead.
export default function MissingPage() {
  notFound();
}
