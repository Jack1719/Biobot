"use client";
import { useCallback, useRef, useState } from "react";
import { KitData } from "../types";
import useLocalSearchCache from "../hooks/localSearchCache";
import { clear } from "console";

export interface AutoCompleteProps {
  onSelect?: (kitdata: KitData) => void;
}
export default function KitSearchAutoComplete({}: AutoCompleteProps) {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [searchResult, setSearchResult] = useState<KitData[]>([]);
  const { updateSearchCacheData, checkIfSearchQueryIsInCache } =
    useLocalSearchCache();
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const callSearchApi = useCallback(
    async (searchQuery: string) => {
      const cachedData = checkIfSearchQueryIsInCache(searchQuery);
      if (cachedData) {
        setSearchResult(cachedData);
        return;
      }
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(async () => {
        try {
          setLoading(true);
          console.log("calling api");
          const response = await fetch(`/api/kitData?query=${searchQuery}`);
          const searchResult = await response.json();
          updateSearchCacheData({ query: searchQuery, data: searchResult });
          setSearchResult(searchResult);
        } catch (error) {
          setError("Something went wrong");
        } finally {
          setLoading(false);
          if (debounceRef.current) clearTimeout(debounceRef.current);
        }
      }, 1000);
    },
    [
      updateSearchCacheData,
      setSearchResult,
      setError,
      checkIfSearchQueryIsInCache,
    ]
  );
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    callSearchApi(e.target.value);
  };
  return (
    <div>
      <input value={searchQuery} onChange={handleInputChange} />
    </div>
  );
}
