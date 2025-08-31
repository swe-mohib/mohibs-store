import getProduct from "@/actions/get-product";
import getProducts from "@/actions/get-products";
import Gallery from "@/components/gallery";
import { Info } from "@/components/info";
import ProductList from "@/components/product-list";
import Container from "@/components/ui/container";

interface ProductPageProps {
  params: {
    productId: string;
  };
}

const ProductPage: React.FC<ProductPageProps> = async ({ params }) => {
  const { productId } = await params;
  const product = await getProduct(productId);
  const relatedProducts = await getProducts({
    categoryId: product?.category?.id,
  });

  // Filter out the current product from the related products
  const suggestedProducts = relatedProducts.filter(
    (product) => product.id !== productId
  );
  return (
    <div className="bg-white">
      <Container>
        <div className="px-4 py-10 sm:px-6 lg:px-8">
          <div className="md:grid md:grid-cols-2 md:items-start md:gap-x-8">
            <Gallery images={product.images} />
            <div className="mt-10 md:mt-0">
              <Info data={product} />
            </div>
          </div>

          <hr className="my-10" />
          <ProductList title="You might also like" items={suggestedProducts} />
        </div>
      </Container>
    </div>
  );
};

export default ProductPage;
