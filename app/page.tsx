"use client";
import KitSearchAutoComplete from "./components/kitSearchAutoComplete";
import { KitData } from "./types";

export default function Home() {
  const onSelect = (kitdata: KitData) => {
    console.log(kitdata);
  };
  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-24">
      <span>Search kit autocomplete</span>
      <KitSearchAutoComplete onSelect={onSelect} />
    </main>
  );
}
