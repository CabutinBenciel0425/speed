export const folderPathIdentifier = (from: string) => {
  switch (from) {
    case "customer":
      return "/images/customer";
    case "merchant/logo":
      return "/images/merchant/logo";
    case "merchant/banner":
      return "/images/merchant/banner";
    case "driver":
      return "/images/driver";
    case "category":
      return "/images/category";
    case "product":
      return "/images/merchant/products";
    default:
      return "/images";
  }
};
