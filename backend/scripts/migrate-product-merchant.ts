import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "../models/product.model.js";
import Merchant from "../models/merchant.model.js";

dotenv.config();

const migrate = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log("Connected to DB");

    const products = await Product.find().populate<{
      merchant: { merchantName: string; logo: string };
    }>("merchant");

    let updatedCount = 0;

    for (const product of products) {
      const merchant = product.merchant;
      if (
        merchant &&
        typeof merchant === "object" &&
        "merchantName" in merchant &&
        "logo" in merchant
      ) {
        product.merchantName = merchant.merchantName;
        product.merchantLogo = merchant.logo || "";
        await product.save();
        updatedCount++;
      }
    }

    console.log(`✅ Successfully updated ${updatedCount} products`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
};

migrate();
