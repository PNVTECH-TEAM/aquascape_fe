import { EMAIL_REGEX_PATTERN } from "@app/core/constants/regex";
import { useTranslation } from "react-i18next";
import * as yup from "yup";

export const useSignUpSchema = () => {
  const { t } = useTranslation();

  return yup.object({
    fullName: yup.string().required(
      t("REGISTER.VALIDATION.REQUIRED", {
        field: t("REGISTER.REQUIREMENT.FULL_NAME"),
      }) as string,
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
        t("REGISTER.REQUIREMENT.VALIDATION.INVALID", {
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
      .min(
        6,
        t("REGISTER.VALIDATION.MIN_LENGTH", {
          field: t("REGISTER.REQUIREMENT.PASSWORD"),
          length: 6,
        }) as string,
      ),
  });
};
