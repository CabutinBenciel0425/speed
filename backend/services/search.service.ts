import { getMerchants } from "../controller/merchant.controller.js";
import Merchant, { type IMerchant } from "../models/merchant.model.js";
import Product, { type IProduct } from "../models/product.model.js";

export const searchDropdownPublicService = async (query: string) => {
  if (!query || query.trim().length === 0) {
    return { merchants: [], products: [] };
  }
  const merchantQuery = Merchant.find<IMerchant>({
    $or: [
      { merchantName: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } },
    ],
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
      .select("_id merchantName logo averageRating ratingCount description")
      .limit(5)
      .lean(),
    productQuery
      .select("_id name price image merchantName merchant ingredients")
      .limit(5)
      .lean(),
  ]);

  return { merchants, products };
};

// export const searchPagePublicService = async (query: string) => {
//   if (!query || query.trim().length === 0) {
//     return { merchants: [], products: [] };
//   }
//   // const merchantQuery = Merchant.find<IMerchant>({
//   //   merchantName: { $regex: query, $options: "i" },
//   // });

//   // const productQuery = Product.find<IProduct>({
//   //   $or: [
//   //     { name: { $regex: query, $options: "i" } },
//   //     { description: { $regex: query, $options: "i" } },
//   //     // { merchantName: { $regex: query, $options: "i" } },
//   //   ],
//   // });

//   const merchants = await getMerchants()

//   // const [merchants, products] = await Promise.all([
//   //   merchantQuery.lean().limit(5),
//   //   productQuery.lean().limit(5),
//   // ]);

//   return { merchants, products };
// };
