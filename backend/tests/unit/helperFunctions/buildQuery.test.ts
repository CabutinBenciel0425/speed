import { describe, expect, test } from "vitest";
import { buildQuery } from "../../../utils/buildQuery";

describe("buildQuery tests", () => {
  test("passing an empty object, returns default values", () => {
    expect(buildQuery({})).toStrictEqual({
      page: 1,
      limit: 10,
      skip: 0,
      sort: "-averageRating",
      select: "",
      search: "",
      filter: {},
    });
  });

  test("numeric string - page parsing", () => {
    expect(buildQuery({ page: "3" })).toStrictEqual({
      page: 3,
      limit: 10,
      skip: 20,
      sort: "-averageRating",
      select: "",
      search: "",
      filter: {},
    });
  });

  test("actual number - page parsing", () => {
    expect(buildQuery({ page: 2 })).toStrictEqual({
      page: 2,
      limit: 10,
      skip: 10,
      sort: "-averageRating",
      select: "",
      search: "",
      filter: {},
    });
  });

  test("zero - page parsing", () => {
    expect(buildQuery({ page: 0 })).toStrictEqual({
      page: 1,
      limit: 10,
      skip: 0,
      sort: "-averageRating",
      select: "",
      search: "",
      filter: {},
    });
  });

  test("negative - page parsing", () => {
    expect(buildQuery({ page: "-5" })).toStrictEqual({
      page: 1,
      limit: 10,
      skip: 0,
      sort: "-averageRating",
      select: "",
      search: "",
      filter: {},
    });
  });

  test("non-numeric - page parsing", () => {
    expect(buildQuery({ page: "abc" })).toStrictEqual({
      page: 1,
      limit: 10,
      skip: 0,
      sort: "-averageRating",
      select: "",
      search: "",
      filter: {},
    });
  });

  test("numeric string - limit parsing and capping", () => {
    expect(buildQuery({ limit: "25" })).toStrictEqual({
      page: 1,
      limit: 25,
      skip: 0,
      sort: "-averageRating",
      select: "",
      search: "",
      filter: {},
    });
  });

  test("above cap - limit parsing and capping", () => {
    expect(buildQuery({ limit: "100" })).toStrictEqual({
      page: 1,
      limit: 50,
      skip: 0,
      sort: "-averageRating",
      select: "",
      search: "",
      filter: {},
    });
  });

  test("exactly at cap - limit parsing and capping", () => {
    expect(buildQuery({ limit: "50" })).toStrictEqual({
      page: 1,
      limit: 50,
      skip: 0,
      sort: "-averageRating",
      select: "",
      search: "",
      filter: {},
    });
  });

  test("just above cap - limit parsing and capping", () => {
    expect(buildQuery({ limit: "51" })).toStrictEqual({
      page: 1,
      limit: 50,
      skip: 0,
      sort: "-averageRating",
      select: "",
      search: "",
      filter: {},
    });
  });

  test("zero - limit parsing and capping", () => {
    expect(buildQuery({ limit: 0 })).toStrictEqual({
      page: 1,
      limit: 10,
      skip: 0,
      sort: "-averageRating",
      select: "",
      search: "",
      filter: {},
    });
  });

  test("non-numeric - limit parsing and capping", () => {
    expect(buildQuery({ limit: "abc" })).toStrictEqual({
      page: 1,
      limit: 10,
      skip: 0,
      sort: "-averageRating",
      select: "",
      search: "",
      filter: {},
    });
  });

  test("skip math - page 1 default limit", () => {
    expect(buildQuery({ page: 1 })).toStrictEqual({
      page: 1,
      limit: 10,
      skip: 0,
      sort: "-averageRating",
      select: "",
      search: "",
      filter: {},
    });
  });

  test("skip math - page 2 limit 10", () => {
    expect(buildQuery({ page: 2, limit: 10 })).toStrictEqual({
      page: 2,
      limit: 10,
      skip: 10,
      sort: "-averageRating",
      select: "",
      search: "",
      filter: {},
    });
  });

  test("skip math - page 3 limit 5", () => {
    expect(buildQuery({ page: 3, limit: 5 })).toStrictEqual({
      page: 3,
      limit: 5,
      skip: 10,
      sort: "-averageRating",
      select: "",
      search: "",
      filter: {},
    });
  });

  test("reserved keys stripped - reserved key 'page'", () => {
    expect(buildQuery({ page: 1, category: "shoes" })).toStrictEqual({
      page: 1,
      limit: 10,
      skip: 0,
      sort: "-averageRating",
      select: "",
      search: "",
      filter: { category: "shoes" },
    });
  });
  test("reserved keys stripped - reserved key 'limit'", () => {
    expect(buildQuery({ limit: 5, category: "shoes" })).toStrictEqual({
      page: 1,
      limit: 5,
      skip: 0,
      sort: "-averageRating",
      select: "",
      search: "",
      filter: { category: "shoes" },
    });
  });
  test("reserved keys stripped - reserved key 'sort'", () => {
    expect(
      buildQuery({ sort: "averageRating", category: "shoes" }),
    ).toStrictEqual({
      page: 1,
      limit: 10,
      skip: 0,
      sort: "averageRating",
      select: "",
      search: "",
      filter: { category: "shoes" },
    });
  });
  test("reserved keys stripped - reserved key 'fields'", () => {
    expect(buildQuery({ fields: "name", category: "shoes" })).toStrictEqual({
      page: 1,
      limit: 10,
      skip: 0,
      sort: "-averageRating",
      select: "name",
      search: "",
      filter: { category: "shoes" },
    });
  });
  test("reserved keys stripped - reserved key 'search'", () => {
    expect(buildQuery({ search: "abc", category: "shoes" })).toStrictEqual({
      page: 1,
      limit: 10,
      skip: 0,
      sort: "-averageRating",
      select: "",
      search: "abc",
      filter: { category: "shoes" },
    });
  });
  test("reserved keys stripped - reserved key 'open'", () => {
    expect(buildQuery({ open: true, category: "shoes" })).toStrictEqual({
      page: 1,
      limit: 10,
      skip: 0,
      sort: "-averageRating",
      select: "",
      search: "",
      filter: { category: "shoes" },
    });
  });
  test("reserved keys stripped - reserved key 'maxDist'", () => {
    expect(buildQuery({ maxDist: "5", category: "shoes" })).toStrictEqual({
      page: 1,
      limit: 10,
      skip: 0,
      sort: "-averageRating",
      select: "",
      search: "",
      filter: { category: "shoes" },
    });
  });
  test("reserved keys stripped - reserved key 'lat'", () => {
    expect(buildQuery({ lat: "14.22343", category: "shoes" })).toStrictEqual({
      page: 1,
      limit: 10,
      skip: 0,
      sort: "-averageRating",
      select: "",
      search: "",
      filter: { category: "shoes" },
    });
  });
  test("reserved keys stripped - reserved key 'lng'", () => {
    expect(buildQuery({ lng: "104.89456", category: "shoes" })).toStrictEqual({
      page: 1,
      limit: 10,
      skip: 0,
      sort: "-averageRating",
      select: "",
      search: "",
      filter: { category: "shoes" },
    });
  });
  test("reserved key survived - reserved key 'page'", () => {
    expect(buildQuery({ page: 2, filter: { page: 3 } })).toStrictEqual({
      page: 2,
      limit: 10,
      skip: 10,
      sort: "-averageRating",
      select: "",
      search: "",
      filter: { filter: { page: 3 } },
    });
  });

  test("operator conversion - 'gte'", () => {
    expect(buildQuery({ gte: "10" })).toStrictEqual({
      page: 1,
      limit: 10,
      skip: 0,
      sort: "-averageRating",
      select: "",
      search: "",
      filter: { $gte: 10 },
    });
  });

  test("operator conversion - 'gt'", () => {
    expect(buildQuery({ gt: "20" })).toStrictEqual({
      page: 1,
      limit: 10,
      skip: 0,
      sort: "-averageRating",
      select: "",
      search: "",
      filter: { $gt: 20 },
    });
  });

  test("operator conversion - 'lte'", () => {
    expect(buildQuery({ lte: "30" })).toStrictEqual({
      page: 1,
      limit: 10,
      skip: 0,
      sort: "-averageRating",
      select: "",
      search: "",
      filter: { $lte: 30 },
    });
  });

  test("operator conversion - 'lt'", () => {
    expect(buildQuery({ lt: "40" })).toStrictEqual({
      page: 1,
      limit: 10,
      skip: 0,
      sort: "-averageRating",
      select: "",
      search: "",
      filter: { $lt: 40 },
    });
  });

  test("operator conversion - nested under a real field", () => {
    expect(buildQuery({ price: { gte: "100" } })).toStrictEqual({
      page: 1,
      limit: 10,
      skip: 0,
      sort: "-averageRating",
      select: "",
      search: "",
      filter: { price: { $gte: 100 } },
    });
  });

  test("operator conversion - inside an array", () => {
    expect(
      buildQuery({ price: [{ gte: "100" }, { gte: "200" }, { gte: "300" }] }),
    ).toStrictEqual({
      page: 1,
      limit: 10,
      skip: 0,
      sort: "-averageRating",
      select: "",
      search: "",
      filter: { price: [{ $gte: 100 }, { $gte: 200 }, { $gte: 300 }] },
    });
  });

  test("operator conversion - mixed", () => {
    expect(buildQuery({ gte: "100", price: { gte: "200" } })).toStrictEqual({
      page: 1,
      limit: 10,
      skip: 0,
      sort: "-averageRating",
      select: "",
      search: "",
      filter: { $gte: 100, price: { $gte: 200 } },
    });
  });

  test("non-numeric operators stay strings - non-numeric strings", () => {
    expect(buildQuery({ gte: "abc" })).toStrictEqual({
      page: 1,
      limit: 10,
      skip: 0,
      sort: "-averageRating",
      select: "",
      search: "",
      filter: { $gte: "abc" },
    });
  });

  test("non-numeric operators stay strings - already numeric", () => {
    expect(buildQuery({ gte: 100 })).toStrictEqual({
      page: 1,
      limit: 10,
      skip: 0,
      sort: "-averageRating",
      select: "",
      search: "",
      filter: { $gte: 100 },
    });
  });

  test("non-numeric operators stay strings - unusual string", () => {
    expect(buildQuery({ gte: "abc100" })).toStrictEqual({
      page: 1,
      limit: 10,
      skip: 0,
      sort: "-averageRating",
      select: "",
      search: "",
      filter: { $gte: "abc100" },
    });
  });

  test("sort - provided value", () => {
    expect(buildQuery({ sort: "price" })).toStrictEqual({
      page: 1,
      limit: 10,
      skip: 0,
      sort: "price",
      select: "",
      search: "",
      filter: {},
    });
  });

  test("sort - default", () => {
    expect(buildQuery({ sort: "" })).toStrictEqual({
      page: 1,
      limit: 10,
      skip: 0,
      sort: "-averageRating",
      select: "",
      search: "",
      filter: {},
    });
  });

  test("select - multiple fields", () => {
    expect(buildQuery({ fields: "name,price,rating" })).toStrictEqual({
      page: 1,
      limit: 10,
      skip: 0,
      sort: "-averageRating",
      select: "name price rating",
      search: "",
      filter: {},
    });
  });

  test("select - single fields", () => {
    expect(buildQuery({ fields: "name" })).toStrictEqual({
      page: 1,
      limit: 10,
      skip: 0,
      sort: "-averageRating",
      select: "name",
      search: "",
      filter: {},
    });
  });

  test("select - missing fields", () => {
    expect(buildQuery({ fields: "" })).toStrictEqual({
      page: 1,
      limit: 10,
      skip: 0,
      sort: "-averageRating",
      select: "",
      search: "",
      filter: {},
    });
  });

  test("search - provided", () => {
    expect(buildQuery({ search: "burger" })).toStrictEqual({
      page: 1,
      limit: 10,
      skip: 0,
      sort: "-averageRating",
      select: "",
      search: "burger",
      filter: {},
    });
  });

  test("search - missing", () => {
    expect(buildQuery({ search: "" })).toStrictEqual({
      page: 1,
      limit: 10,
      skip: 0,
      sort: "-averageRating",
      select: "",
      search: "",
      filter: {},
    });
  });

  test("combined behavior", () => {
    expect(
      buildQuery({
        page: "2",
        limit: "25",
        sort: "price",
        fields: "name,price",
        search: "shoes",
      }),
    ).toStrictEqual({
      page: 2,
      limit: 25,
      skip: 25,
      sort: "price",
      select: "name price",
      search: "shoes",
      filter: {},
    });
  });

  test("combined behavior - nested price", () => {
    expect(
      buildQuery({ filter: { price: { gte: "100", lte: "200" } } }),
    ).toStrictEqual({
      page: 1,
      limit: 10,
      skip: 0,
      sort: "-averageRating",
      select: "",
      search: "",
      filter: { filter: { price: { $gte: 100, $lte: 200 } } },
    });
  });

  test("combined behavior - plain category field", () => {
    expect(buildQuery({ category: "" })).toStrictEqual({
      page: 1,
      limit: 10,
      skip: 0,
      sort: "-averageRating",
      select: "",
      search: "",
      filter: { category: "" },
    });
  });
});
