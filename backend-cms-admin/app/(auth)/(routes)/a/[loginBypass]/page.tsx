"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSignIn, useSession } from "@clerk/nextjs";
import Image from "next/image";
import toast from "react-hot-toast";

import loading from "@/public/loading.gif";

export default function CustomSignInForm() {
  const router = useRouter();
  const params = useParams<{ loginBypass?: string }>();
  const { isSignedIn } = useSession();
  const { signIn, setActive, isLoaded } = useSignIn();

  const email = "admin@gmail.com";
  const hasAttempted = useRef(false);

  const handleLogin = useCallback(async () => {
    if (!isLoaded) return;
    if (hasAttempted.current) return; // ✅ Prevent duplicate runs
    hasAttempted.current = true;

    if (isSignedIn) {
      toast("You're already signed in.");
      router.push("/");
      return;
    }

    try {
      const passwordParam = params?.loginBypass;
      if (!passwordParam) throw new Error("Missing loginBypass param");

      const password = decodeURIComponent(passwordParam);

      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        toast.success("Signed in as Admin");
        router.push("/");
      } else {
        throw new Error("Sign-in not completed.");
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Sign-in failed. Please try again.";
      toast.error(message);
    }
  }, [email, isLoaded, isSignedIn, params, router, setActive, signIn]);

  useEffect(() => {
    // Only run when Clerk is ready
    if (isLoaded) {
      handleLogin();
    }
  }, [isLoaded, handleLogin]);

  const handleHome = () => router.push("/");

  return (
    <div className="flex flex-col items-center space-y-3 mt-10">
      <button
        onClick={handleHome}
        className="text-blue-600 hover:text-blue-800 visited:text-purple-600 underline cursor-pointer"
      >
        Home
      </button>
      <h2 className="text-yellow-600 font-medium text-lg">
        Signing you in as Admin…
      </h2>
      <Image src={loading} alt="Loading..." className="w-28 h-auto" />
    </div>
  );
}
