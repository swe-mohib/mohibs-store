"use client";

import { Button } from "@/components/ui/button";
import ClerkAuth from "../(auth)/clerk/page";
import { useStoreModal } from "@/hooks/useStoreModal";
import { useEffect } from "react";

export default function Home() {
  const onOpen = useStoreModal((state) => state.onOpen);
  const isOpen = useStoreModal((state) => state.isOpen);

  useEffect(() => {
    if (!isOpen) {
      onOpen();
    }
  }, [isOpen, onOpen]);
  return (
    <>
      <ClerkAuth />
      <Button size={"sm"}>Click Me</Button>
    </>
  );
}
