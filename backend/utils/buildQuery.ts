export const buildQuery = (passedQuery: any) => {
  const page = Math.max(Number(passedQuery.page) || 1, 1);
  const limit = Math.min(Number(passedQuery.limit) || 10, 50);

  const filterObj = { ...passedQuery };

  // Delete params that don't belong in the filter
  delete filterObj.page;
  delete filterObj.limit;
  delete filterObj.sort;
  delete filterObj.fields;
  delete filterObj.search;
  delete filterObj.open;
  delete filterObj.maxDist;
  delete filterObj.lat;
  delete filterObj.lng;

  const coerceNumericOperators = (obj: any): any => {
    if (Array.isArray(obj)) return obj.map(coerceNumericOperators);
    if (obj && typeof obj === "object") {
      const result: any = {};
      for (const key in obj) {
        const value = obj[key];
        if (
          ["$gte", "$lte", "$gt", "$lt"].includes(key) &&
          typeof value === "string" &&
          !isNaN(Number(value))
        ) {
          result[key] = Number(value);
        } else {
          result[key] = coerceNumericOperators(value);
        }
      }
      return result;
    }
    return obj;
  };

  let queryStr = JSON.stringify(filterObj);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

  const parsed = JSON.parse(queryStr);
  const filter = coerceNumericOperators(parsed);

  return {
    filter,
    page,
    limit,
    skip: (page - 1) * limit,
    sort: passedQuery.sort || "-averageRating",
    select: passedQuery.fields?.replace(/,/g, " ") || "",
    search: passedQuery.search || "",
  };
};
