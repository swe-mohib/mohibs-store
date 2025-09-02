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
          <div className="sm:grid sm:grid-cols-2 sm:items-start sm:gap-x-8  lg:grid-cols-3">
            <Gallery images={product.images} />
            <div className="mt-10 sm:mt-0 lg:col-span-2">
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
