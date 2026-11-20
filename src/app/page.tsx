import { readPortfolioData } from "@/lib/portfolio-server";
import { PortfolioProvider } from "@/context/PortfolioContext";
import SmoothScrollProvider from "@/components/SmoothScrollProvider";
import Preloader from "@/components/Preloader";
import CustomCursor from "@/components/CustomCursor";
import Navbar from "@/components/Navbar";
import HeroAboutStage from "@/components/HeroAboutStage";
import EditorialMarquee from "@/components/EditorialMarquee";
import TechStackSection from "@/components/TechStackSection";
import ProjectsSection from "@/components/ProjectsSection";
import ExperienceSection from "@/components/ExperienceSection";
import ContactSection from "@/components/ContactSection";
import CrowdFooter from "@/components/CrowdFooter";
import AskAiWidget from "@/components/AskAiWidget";

export const dynamic = "force-dynamic";

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
