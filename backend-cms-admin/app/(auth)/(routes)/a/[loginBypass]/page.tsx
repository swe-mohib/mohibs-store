"use client";
import { useSignIn, useSession } from "@clerk/nextjs";
import { Params } from "next/dist/server/request/params";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import toast from "react-hot-toast";
import Image from "next/image";
import loading from "@/public/loading.gif";

export default function CustomSignInForm() {
  const router = useRouter();
  const params = useParams<Params>();
  const { isSignedIn } = useSession();
  const { signIn, setActive, isLoaded } = useSignIn();
  const email = "admin@gmail.com";

  const handleLogin = async () => {
    if (!isLoaded) return;

    if (isSignedIn) {
      toast("You're already signed in.");
      // router.push("/");
      return;
    }
    try {
      const p = params?.loginBypass?.toString();
      if (!p) {
        throw new Error();
      }
      const password = decodeURIComponent(p);
      // Start sign-in attempt
      const result = await signIn.create({
        identifier: email,
        password,
      });

      // set session as active
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        toast.success("Sign-in as Admin");
        router.push("/");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Sign-in failed .Something went wrong.";
      toast.error(errorMessage);
      toast("Refresh to re-attempt.");
    }
  };

  const handleHome = () => {
    router.push("/");
  };

  useEffect(() => {
    handleLogin();
  });
  return (
    <div className="flex flex-col items-center">
      <button
        onClick={handleHome}
        className="text-blue-600 hover:text-blue-800 visited:text-purple-600 underline cursor-pointer"
      >
        Home
      </button>
      <h2 className="text-yellow-600">Signing you in as Admin…</h2>
      <Image src={loading} alt="loading..." className="w-28" />
    </div>
  );
}
