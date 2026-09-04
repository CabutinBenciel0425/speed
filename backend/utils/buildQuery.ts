export const buildQuery = (passedQuery: any) => {
  const page = Math.max(Number(passedQuery.page) || 1, 1);
  const limit = Math.min(Number(passedQuery.limit) || 10, 50);

  const filterObj = { ...passedQuery };

  delete filterObj.page;
  delete filterObj.limit;
  delete filterObj.sort;
  delete filterObj.fields;
  delete filterObj.search;
  delete filterObj.open;

  let queryStr = JSON.stringify(filterObj);

  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

  return {
    filter: JSON.parse(queryStr),
    page,
    limit,
    skip: (page - 1) * limit,
    sort: passedQuery.sort || "-averageRating",
    select: passedQuery.fields?.replace(/,/g, " ") || "",
    search: passedQuery.search || "",
  };
};
