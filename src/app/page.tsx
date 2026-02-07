import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import Problems from "@/components/landing/Problems";
import FounderStory from "@/components/landing/FounderStory";
import Features from "@/components/landing/Features";
import FeatureVote from "@/components/landing/FeatureVote";
import Testimonial from "@/components/landing/Testimonial";
import Pricing from "@/components/landing/Pricing";
import FinalCTA from "@/components/landing/FinalCTA";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <Problems />
        <FounderStory />
        <section id="features">
          <Features />
        </section>
        <FeatureVote />
        <Testimonial />
        <section id="pricing">
          <Pricing />
        </section>
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
