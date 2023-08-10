import { useCallback, useEffect, useRef } from "react";
import { KitData, SearchData } from "../types";

export default function useLocalSearchCache() {
  const localSearchCacheRef = useRef<Map<string, KitData[]>>(new Map());
  const updateSearchCacheData = useCallback(
    (searchData: SearchData) => {
      if (!searchData.query) return;
      // check if new data contains existing data, if so, remove the existing data
      localSearchCacheRef.current.forEach((value, key) => {
        if (key.includes(searchData.query)) {
          localSearchCacheRef.current.delete(key);
          localStorage.removeItem(`searchdata-${key}`);
        }
      });
      localSearchCacheRef.current.set(searchData.query, searchData.data);
      localStorage.setItem(
        `searchdata-${searchData.query}`,
        JSON.stringify(searchData.data)
      );
    },
    [localSearchCacheRef]
  );

  useEffect(() => {
    // initialize the localSearchCache map with all the search data in localStorage
    const searchCacheData = new Map<string, KitData[]>();
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      // search through all keys in localStorage and see if they start with "searchdata-", if so, parse the value and add it to the searchCacheData map
      if (key && key.startsWith("searchdata-")) {
        const value = localStorage.getItem(key);
        if (value) {
          const data = JSON.parse(value) as KitData[];
          searchCacheData.set(key.substring(11), data);
        }
      }
    }
    localSearchCacheRef.current = searchCacheData;
  }, [localSearchCacheRef]);
  const checkIfSearchQueryIsInCache = useCallback(
    (searchQuery: string) => {
      // if the searchQuery is in the localSearchCacheRef, then use that data instead of calling the API
      if (localSearchCacheRef.current.has(searchQuery)) {
        return localSearchCacheRef.current.get(searchQuery) || [];
      }
      // this allows us to skip the API call if the searchQuery contains previous searchQuery
      const entries = localSearchCacheRef.current.entries();

      for (const [key, value] of entries) {
        if (searchQuery.includes(key)) {
          return value.filter(
            (kitData: KitData) =>
              kitData.label_id.search(searchQuery) !== -1 ||
              kitData.shipping_tracking_code.search(searchQuery) !== -1
          );
        }
      }
      
      return null;
    },

    [localSearchCacheRef]
  );

  return {updateSearchCacheData, checkIfSearchQueryIsInCache}
}