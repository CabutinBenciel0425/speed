import Merchant, { type IMerchant } from "../models/merchant.model.js";
import Product, { type IProduct } from "../models/product.model.js";

export const searchDropdownPublicService = async (query: string) => {
  if (!query || query.trim().length === 0) {
    return { merchants: [], products: [] };
  }
  const merchantQuery = Merchant.find<IMerchant>({
    merchantName: { $regex: query, $options: "i" },
  });

  const productQuery = Product.find<IProduct>({
    $or: [
      { name: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } },
      { merchantName: { $regex: query, $options: "i" } },
    ],
  });

  const [merchants, products] = await Promise.all([
    merchantQuery
      .select("merchantName logo averageRating ratingCount")
      .limit(5)
      .lean(),
    productQuery
      .select("name price image merchantName merchant")
      .limit(5)
      .lean(),
  ]);

  return { merchants, products };
};
