import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { registerApi, loginApi } from "@app/core/services";
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
    onSuccess: (response: { message: string }) => {
      openNotificationWithIcon(
        NotificationTypeEnum.SUCCESS,
        response.message || t("NOTIFICATION.SUCCESS"),
      );
      navigate("/login");
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
         t("NOTIFICATION.SUCCESS"),
      );

      localStorage.setItem("accessToken", token);
      navigate("/");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      openNotificationWithIcon(
        NotificationTypeEnum.ERROR,
        error.response?.data?.message ?? t("NOTIFICATION.ERROR"),
      );
    },
  });
};
