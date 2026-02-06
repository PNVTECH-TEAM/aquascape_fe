import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  loginApi,
  registerApi,
  resendOtpApi,
  verifyOtpApi,
} from "@app/core/services";
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
      response: { code: number; message: string },
      variables: RegisterPayload,
    ) => {
      if (response.code === 1001) {
        openNotificationWithIcon(
          NotificationTypeEnum.ERROR,
          t("REGISTER.EMAIL_EXISTS"),
        );
        return;
      }

      if (response.code !== 200) {
        openNotificationWithIcon(
          NotificationTypeEnum.ERROR,
          response.message || t("NOTIFICATION.ERROR"),
        );
        return;
      }

      openNotificationWithIcon(
        NotificationTypeEnum.SUCCESS,
        t("REGISTER.SUCCESS"),
      );

      navigate("/userVerify", {
        state: {
          email: variables.email,
        },
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

export const useVerifyOtp = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: async (payload: { email: string; otp: string }) => {
      const { data } = await verifyOtpApi(payload);
      return data;
    },
    onSuccess: (response: { message: string }) => {
      openNotificationWithIcon(
        NotificationTypeEnum.SUCCESS,
        response.message || t("OTP_VERIFY.VERIFY.SUCCESS"),
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
        error.response?.data?.message || t("OTP_VERIFY.VERIFY.INVALID"),
      );
    },
  });
};

export const useResendOtp = () => {
  const { t } = useTranslation();
  return useMutation({
    mutationFn: async (payload: { email: string }) => {
      const { data } = await resendOtpApi(payload);
      return data;
    },
    onSuccess: (response: { message: string }) => {
      openNotificationWithIcon(
        NotificationTypeEnum.SUCCESS,
        response.message || t("OTP_VERIFY.VERIFY.RESEND_SUCCESS"),
      );
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      openNotificationWithIcon(
        NotificationTypeEnum.ERROR,
        error.response?.data?.message ?? t("OTP_VERIFY.VERIFY.RESEND_FAILED"),
      );
    },
  });
};
