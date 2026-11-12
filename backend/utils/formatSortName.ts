const VALID_CHARS = /^[a-zA-Z][a-zA-Z0-9]*$/;

export const formatSortName = (value: string, prefix: string) => {
  if (!VALID_CHARS.test(prefix)) {
    throw new Error(`Invalid prefix: "${prefix}"`);
  }

  const isDesc = value.startsWith("-");

  const field = isDesc ? value.slice(1) : value;

  if (value.startsWith("+")) {
    throw new Error(`Invalid sort symbol in "${value}" (only '-' is allowed)`);
  }

  if (!VALID_CHARS.test(field)) {
    throw new Error(`Invalid sort field: "${value}"`);
  }

  return `${isDesc ? "-" : ""}${prefix}.${field}`;
};
