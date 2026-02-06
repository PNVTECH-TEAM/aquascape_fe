import React from "react";
import { Image, Typography } from "antd";

import "./AquaForestSplash.scss";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { logoAquarium } from "@app/assets/images";

const { Title } = Typography;

const AquaForestSplash: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="dashboard-splash">
      <div className="fixed flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-6 text-center">
          <Image src={logoAquarium} preview={false} width={160} />

          <Title
            level={3}
            className="!m-0 font-semibold cursor-pointer"
            onClick={() => navigate("/aquaIntro")}
          >
            {t("AQUAFORESTSPLASH.TITLE")}
          </Title>
        </div>
      </div>
    </div>
  );
};

export default AquaForestSplash;