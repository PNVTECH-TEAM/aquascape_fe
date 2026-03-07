import { EMAIL_REGEX_PATTERN, PASSWORD_REGEX } from "@app/core/constants/regex";
import { useTranslation } from "react-i18next";
import * as yup from "yup";

export const useSignUpSchema = () => {
  const { t } = useTranslation();

  return yup.object({
    fullName: yup
      .string()
      .required(
        t("REGISTER.VALIDATION.REQUIRED", {
          field: t("REGISTER.REQUIREMENT.FULL_NAME"),
        }) as string,
      )
      .matches(
        /^[A-Za-zÀ-ỹ\s]+$/,
        t("REGISTER.VALIDATION.NAME_INVALID") as string,
      ),

    email: yup
      .string()
      .required(
        t("REGISTER.VALIDATION.REQUIRED", {
          field: t("REGISTER.REQUIREMENT.EMAIL"),
        }) as string,
      )
      .matches(
        EMAIL_REGEX_PATTERN,
        t("REGISTER.VALIDATION.INVALID", {
          field: t("REGISTER.REQUIREMENT.EMAIL"),
        }) as string,
      ),

    password: yup
      .string()
      .required(
        t("REGISTER.VALIDATION.REQUIRED", {
          field: t("REGISTER.REQUIREMENT.PASSWORD"),
        }) as string,
      )
      .matches(
        PASSWORD_REGEX,
        t("REGISTER.VALIDATION.PASSWORD_RULE") as string,
      ),
  });
};
