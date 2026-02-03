import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const RegisterNavigate = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <span
      onClick={() => navigate("/login")}
      className="text-blue-600 font-bold cursor-pointer"
    >
      {t("REGISTER.REQUIREMENT.LOGIN")}
    </span>
  );
};

export default RegisterNavigate;
