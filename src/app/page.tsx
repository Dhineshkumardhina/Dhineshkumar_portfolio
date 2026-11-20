import dynamic from "next/dynamic";
import { readPortfolioData } from "@/lib/portfolio-server";
import { PortfolioProvider } from "@/context/PortfolioContext";
import SmoothScrollProvider from "@/components/SmoothScrollProvider";
import Preloader from "@/components/Preloader";
import Navbar from "@/components/Navbar";
import HeroAboutStage from "@/components/HeroAboutStage";
import EditorialMarquee from "@/components/EditorialMarquee";
import TechStackSection from "@/components/TechStackSection";

// Code-split below-the-fold & overlay widgets so Hero + Navbar paint immediately
const CustomCursor = dynamic(() => import("@/components/CustomCursor"));
const ProjectsSection = dynamic(() => import("@/components/ProjectsSection"));
const ExperienceSection = dynamic(() => import("@/components/ExperienceSection"));
const ContactSection = dynamic(() => import("@/components/ContactSection"));
const CrowdFooter = dynamic(() => import("@/components/CrowdFooter"));
const AskAiWidget = dynamic(() => import("@/components/AskAiWidget"));

export const dynamicParams = true;
export const revalidate = 0;

export default async function HomePage() {
  const data = await readPortfolioData();

  return (
    <PortfolioProvider initialData={data}>
      <SmoothScrollProvider>
        <Preloader />
        <CustomCursor />
        <main className="relative min-h-screen w-full bg-white text-[#0A0A0A]">
          <Navbar />
          <HeroAboutStage />
          <EditorialMarquee />
          <TechStackSection />
          <ProjectsSection />
          <ExperienceSection />
          <ContactSection />
          <CrowdFooter />
          <AskAiWidget />
        </main>
      </SmoothScrollProvider>
    </PortfolioProvider>
  );
}
