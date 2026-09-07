import { Suspense } from "react";
import { Attention } from "@/components/attention";

export const metadata = {
  title: "Product — KIT",
  description: "See a project-driven business as one living field.",
};

export default function HabitatPage() {
  return (
    <Suspense>
      <Attention />
    </Suspense>
  );
}
