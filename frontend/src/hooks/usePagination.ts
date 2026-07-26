"use client";

import { useState, useCallback } from "react";

interface UsePaginationReturn {
  page: number;
  setPage: (page: number) => void;
  next: () => void;
  prev: () => void;
  hasNext: boolean;
  hasPrev: boolean;
}

export function usePagination(totalPages: number, initialPage = 1): UsePaginationReturn {
  const [page, setPage] = useState(initialPage);

  const next = useCallback(() => {
    setPage((p) => Math.min(p + 1, totalPages));
  }, [totalPages]);

  const prev = useCallback(() => {
    setPage((p) => Math.max(p - 1, 1));
  }, []);

  return {
    page,
    setPage,
    next,
    prev,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}
