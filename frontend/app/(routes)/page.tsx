import getBillboard from "@/actions/get-billboard";
import Billboard from "@/components/billboard";
import Container from "@/components/ui/container";

const HomePage = async () => {
  const res = await getBillboard("");
  const response = Array.isArray(res) ? res[0] : res;
  return (
    <Container>
      <div className="space-y-10 pb-10">
        <Billboard data={response} />
      </div>
    </Container>
  );
};

export default HomePage;
