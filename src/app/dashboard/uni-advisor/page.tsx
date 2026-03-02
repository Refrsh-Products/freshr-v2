"use client";

import dynamic from "next/dynamic";

const UniAdvisorPage = dynamic(() => import("./UniAdvisorClient"), {
  ssr: false,
});

export default function Page() {
  return <UniAdvisorPage />;
}
