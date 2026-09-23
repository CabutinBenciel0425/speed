export const formatSortName = (value: string, prefix: string) => {
  const isDesc = value.startsWith("-");
  const field = isDesc ? value.slice(1) : value;
  return `${isDesc ? "-" : ""}${prefix}.${field}`;
};
