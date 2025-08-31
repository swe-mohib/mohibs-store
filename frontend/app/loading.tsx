import Container from "@/components/ui/container";

export default function Loading() {
  return (
    <div className="flex items-center justify-center h-full">
      <Container>
        <p className="text-lg">Loading...</p>
      </Container>
    </div>
  );
}
