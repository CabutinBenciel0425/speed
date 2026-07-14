export const generateVerificationToken = (length: number) => {
  const chars = "0123456789";
  let result = "";
  const randomValues = new Uint32Array(length);
  crypto.getRandomValues(randomValues);
  for (let i = 0; i < length; i++) {
    const randomValue = randomValues[i] ?? 0;
    result += chars.charAt(randomValue % chars.length);
  }
  return result;
};
