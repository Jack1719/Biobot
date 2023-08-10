"use client";
import {
  useCallback,
  useRef,
  useState,
  Fragment,
  memo,
  CSSProperties,
  MouseEventHandler,
} from "react";
import { VariableSizeList as List } from "react-window";
import { KitData } from "../types";
import useLocalSearchCache from "../hooks/localSearchCache";

export interface AutoCompleteProps {
  onSelect: (kitdata: KitData) => void;
}
export default function KitSearchAutoComplete({ onSelect }: AutoCompleteProps) {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [searchResult, setSearchResult] = useState<(KitData | Function)[]>([]);
  const { updateSearchCacheData, checkIfSearchQueryIsInCache } =
    useLocalSearchCache();
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const callSearchApi = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery) return;
      const cachedData = checkIfSearchQueryIsInCache(searchQuery);
      if (cachedData) {
        setSearchResult([...cachedData, onSelect]);
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
          setSearchResult([...searchResult, onSelect]);
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
      onSelect,
    ]
  );
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    callSearchApi(e.target.value);
  };
  const itemKey = useCallback(
    (index: number, data: KitData[]) => data[index].label_id,
    []
  );
  const itemSize = useCallback(() => 50, []);
  return (
    <div>
      <label className="relative block w-[300px]">
        <span className="sr-only">Search</span>
        <span className="absolute inset-y-0 left-0 flex items-center pl-2">
          <svg className="h-5 w-5 fill-slate-300" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
              clipRule="evenodd"
            />
          </svg>
        </span>
        <input
          className="placeholder:italic placeholder:text-slate-400 block bg-white w-full border border-slate-300 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
          placeholder="Search for anything..."
          type="text"
          name="search"
          value={searchQuery}
          onChange={handleInputChange}
        />
      </label>

      {/* suggested results */}
      {searchQuery && (
        <Fragment>
          {loading ? (
            <span>Loading...</span>
          ) : (
            <List
              height={187}
              itemCount={searchResult.length - 1}
              itemData={searchResult}
              itemKey={itemKey}
              itemSize={itemSize}
              width={300}
            >
              {Row}
            </List>
          )}
        </Fragment>
      )}
    </div>
  );
}

//TODO add more styles
const KitItem = memo(
  ({
    kitdata,
    onSelect,
    style,
  }: {
    kitdata: KitData;
    onSelect: Function;
    style: CSSProperties;
  }) => (
    <div
      className="h-[50px] border-b border-gray-500 cursor-pointer"
      style={style}
      onClick={() => onSelect(kitdata)}
    >
      <p>Label Id: {kitdata.label_id}</p>
      <p>Shipping Tracking Code:{kitdata.shipping_tracking_code}</p>
    </div>
  )
);
KitItem.displayName = "KitItem";

//TODO optimize this further
const Row = ({
  index,
  data,
  style,
}: {
  index: number;
  data: (KitData | Function)[];
  style: CSSProperties;
}) => {
  if (data.length === index + 1) return;
  return (
    <KitItem
      kitdata={data[index] as KitData}
      style={style}
      onSelect={data[data.length - 1] as Function}
    />
  );
};
