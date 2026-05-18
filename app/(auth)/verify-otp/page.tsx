import { Suspense } from "react";
import VerifyOTPClient from "./VerifyOTPClient";

export default function VerifyOTPPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyOTPClient />
    </Suspense>
  );
}
