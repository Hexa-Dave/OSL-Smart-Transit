"use client";

import { useState } from "react";
import ClientBody from "./ClientBody";
import BottomNav from "@/components/BottomNav";
import HomePage from "@/components/pages/HomePage";
import BuyPage from "@/components/pages/BuyPage";
import PurchasesPage from "@/components/pages/PurchasesPage";
import TravelGuidePage from "@/components/pages/TravelGuidePage";
import InfoPage from "@/components/pages/InfoPage";
import SolutionPage from "@/components/pages/SolutionPage";

type Tab = "home" | "buy" | "purchases" | "travel" | "info" | "solution";

export default function AppPage() {
  const [tab, setTab] = useState<Tab>("home");

  return (
    <ClientBody>
      <main className="min-h-screen pb-20">
        <div className="pt-6">
          {tab === "home" && <HomePage />}
          {tab === "buy" && <BuyPage />}
          {tab === "purchases" && <PurchasesPage />}
          {tab === "travel" && <TravelGuidePage />}
          {tab === "info" && <InfoPage />}
          {tab === "solution" && <SolutionPage />}
        </div>

        <BottomNav value={tab} onChange={setTab} />
      </main>
    </ClientBody>
  );
}
