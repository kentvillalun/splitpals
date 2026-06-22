"use client";

import { useEffect, useState } from "react";
import { supabase } from "../supabase";

export function useFetch({
  table,
  select = "*",
  filters = {},
  orderBy = null,
  limit = null,
  requiredAuth = true,
  refetchCount
}) {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState(null);


  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      let userId = null;
      if (requiredAuth) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          setError("Not authenticated");
          setIsLoading(false);
          return;
        }
        userId = user.id;
      }

      let query = supabase.from(table).select(select);

      if (requiredAuth) {
        query = query.eq("user_id", userId);
      }

      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });

      if (orderBy) {
        query = query.order(orderBy.column, {
          ascending: orderBy.ascending ?? false,
        });
      }

      if (limit) query = query.limit(limit);

      const { data: result, error } = await query;

      if (error) {
        setIsError(true)
        setError(error.message);
      } else {
        setData(result);
      }
      setIsLoading(false);
    };

    fetchData()
  }, [table, JSON.stringify(filters), limit, refetchCount]);

  return { data, isLoading, isError, error}
}
