import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { loginApi, registerApi } from "@app/core/services";
import {
  NotificationTypeEnum,
  openNotificationWithIcon,
} from "@app/core/services/notification/notificationService";
import type { RegisterPayload, LoginPayload } from "@app/core/interface";
import type { AxiosError } from "axios";
import { useTranslation } from "react-i18next";
export const useRegister = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (payload: RegisterPayload) => {
      const { data } = await registerApi(payload);
      return data;
    },
    onSuccess: (
      response: { code?: number; message?: string },
      variables: RegisterPayload,
    ) => {
      const message = response?.message?.toLowerCase() || "";

      if (message.includes("exist")) {
        openNotificationWithIcon(
          NotificationTypeEnum.ERROR,
          t("REGISTER.EMAIL_EXISTS"),
        );
        return;
      }

      openNotificationWithIcon(
        NotificationTypeEnum.SUCCESS,
        t("REGISTER.SUCCESS"),
      );

      navigate("/login", {
        state: { email: variables.email },
      });
    },

    onError: (error: AxiosError<{ message?: string }>) => {
      openNotificationWithIcon(
        NotificationTypeEnum.ERROR,
        error.response?.data?.message ?? t("NOTIFICATION.ERROR"),
      );
    },
  });
};
export const useLogin = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (payload: LoginPayload) => {
      const { data } = await loginApi(payload);
      return data as string;
    },
    onSuccess: (token: string) => {
      openNotificationWithIcon(
        NotificationTypeEnum.SUCCESS,
        t("NOTIFICATION.LOGIN_SUCCESS"),
      );

      localStorage.setItem("accessToken", token);
      navigate("/homePage");
    },
    onError: (error: AxiosError<{ code?: number; message?: string }>) => {
      const errorCode = error.response?.data?.code;

      if (errorCode === 1001) {
        openNotificationWithIcon(
          NotificationTypeEnum.ERROR,
          t("LOGIN.ACCOUNT_NOT_FOUND"),
        );
        return;
      }

      openNotificationWithIcon(
        NotificationTypeEnum.ERROR,
        t("NOTIFICATION.LOGIN_FAILED"),
      );
    },
  });
};
