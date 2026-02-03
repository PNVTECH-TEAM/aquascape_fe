import { EMAIL_REGEX_PATTERN, PASSWORD_REGEX } from "@app/core/constants/regex";
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
    // username: yup
    //   .string()
    //   .required("Username is required")
    //   .min(3, "Username must be at least 3 characters"),

    email: yup
      .string()
      .required(
        t("REGISTER.VALIDATION.REQUIRED", {
          field: t("REGISTER.REQUIREMENT.EMAIL"),
        }) as string,
      )
      .matches(
        EMAIL_REGEX_PATTERN,
        t("REGISTER.VALIDATION.REQUIRED", {
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
        t("REGISTER.REQUIREMENT.PASSWORD_RULE") as string,
      ),
  });
};
