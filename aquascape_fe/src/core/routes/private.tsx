import FishAquarium3D from "@app/pages/Aquarium3D/FishAquarium3D/FishAquarium3D";
import AquaIntro from "@app/pages/Onboarding/AquaIntro";

export const privateRoutes = [
  {
    path: 'aquaIntro',   
    element: <AquaIntro />,
  },
   {
    path: 'fishAquarium',   
    element: <FishAquarium3D />,
  },
];
