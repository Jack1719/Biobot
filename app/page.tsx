"use client";
import KitSearchAutoComplete from "./components/kitSearchAutoComplete";
import { KitData } from "./types";

export default function Home() {
  const onSelect = (kitdata: KitData) => {
    console.log(kitdata);
  };
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <KitSearchAutoComplete onSelect={onSelect} />
    </main>
  );
}
