import { useState } from "react";
import {
  logoAquarium,
  onboardingTank,
  aiAssistant,
  aquascapeCareAI,
} from "@app/assets/images";
import OnboardingCard from "./OnboardingCard";
import { useTranslation } from "react-i18next";
import { useNavigate } from 'react-router-dom';
export default function AquaIntro() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { t } = useTranslation();
  const navigate = useNavigate();

  const slides = [
    {
      image: onboardingTank,
      title: t("ONBOARDING.SLIDE_1.TITLE"),
      description: t("ONBOARDING.SLIDE_1.DESCRIPTION"),
    },
    {
      image: aiAssistant,
      title: t("ONBOARDING.SLIDE_2.TITLE"),
      description: t("ONBOARDING.SLIDE_2.DESCRIPTION"),
    },
    {
      image: aquascapeCareAI,
      title: t("ONBOARDING.SLIDE_3.TITLE"),
      description: t("ONBOARDING.SLIDE_3.DESCRIPTION"),
    },
  ];
 const handleNext = () => {
    if (currentSlide === slides.length - 1) {
      navigate("/register");
    } else {
      setCurrentSlide((prev) => prev + 1);
    }
  };
  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <div className="flex items-center gap-2">
            <img
              src={logoAquarium}
              alt="Aqua Forest Logo"
              className="w-6 h-6 object-contain"
            />
            <h1 className="text-lg font-semibold text-blue-600 mb-0">
              Aqua Forest
            </h1>
          </div>
        </div>

        <OnboardingCard
          image={slides[currentSlide].image}
          title={slides[currentSlide].title}
          description={slides[currentSlide].description}
          currentIndex={currentSlide}
          total={slides.length}
          onNext={handleNext}  
          onDotClick={setCurrentSlide}
          buttonText={
            currentSlide === slides.length - 1 ? "GET STARTED" : "LET'S GO"
          }
        />
      </div>
    </main>
  );
}