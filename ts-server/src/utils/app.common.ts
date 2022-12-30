
export function paginatorNumber (page: number, limit: number) {
  limit = limit > 0 ? limit : 5;
  if (limit > 200) {
    limit = 200;
  }
  return {
    'limit': limit,
    'skip': page > 0 ? (page - 1) * limit : 0
  };
};
