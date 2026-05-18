import { Suspense } from "react";
import CompleteProfileClient from "./CompleteProfileClient";

export default function CompleteProfilePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CompleteProfileClient />
    </Suspense>
  );
}
