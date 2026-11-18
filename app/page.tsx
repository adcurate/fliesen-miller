import { Shell, Values, Regions, FAQ, ContactSection } from "@/components/Shared";
import { Hero, ServiceOverview, Premium, Projects } from "@/components/HomeSections";
import { FunnelSection } from "@/components/Funnel";
import { GoogleReviews } from "@/components/GoogleReviews";
import { StructuredData } from "@/components/StructuredData";
export default function Home() {
  return <Shell><StructuredData path="/" /><Hero /><ServiceOverview /><Premium /><Projects /><GoogleReviews /><Values /><FunnelSection /><FAQ /><ContactSection /><Regions /></Shell>;
}
