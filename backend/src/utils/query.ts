export const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const buildSearchRegex = (search?: string) => {
  const normalized = search?.trim();
  if (!normalized) {
    return null;
  }

  return new RegExp(escapeRegex(normalized), "i");
};

export const getPagination = (page: number, limit: number) => ({
  page,
  limit,
  skip: (page - 1) * limit,
});
