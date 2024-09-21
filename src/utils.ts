export const getCurrentYear = (fallback = 2024) => {
  const year = new Date().getFullYear();

  return year > 2000 ? year : fallback;
};
