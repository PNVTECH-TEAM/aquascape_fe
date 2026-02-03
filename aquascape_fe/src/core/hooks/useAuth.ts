import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { registerApi, resendOtpApi, verifyOtpApi } from "@app/core/services";
import {
  NotificationTypeEnum,
  openNotificationWithIcon,
} from "@app/core/services/notification/notificationService";
import type { RegisterPayload } from "@app/core/interface";
import type { AxiosError } from "axios";

export const useRegister = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (payload: RegisterPayload) => {
      const { data } = await registerApi(payload);
      return data;
    },

    onSuccess: (
      response: { message: string },
      variables: RegisterPayload, // 👈 payload lúc gọi mutate
    ) => {
      openNotificationWithIcon(
        NotificationTypeEnum.SUCCESS,
        response.message || "Đăng ký thành công",
      );

      navigate("/userVerify", {
        state: {
          email: variables.email, // ✅ ĐÚNG
        },
      });
    },

    onError: (error: AxiosError<{ message?: string }>) => {
      openNotificationWithIcon(
        NotificationTypeEnum.ERROR,
        error.response?.data?.message ?? "Đăng ký thất bại",
      );
    },
  });
};

/* ================= VERIFY OTP ================= */
export const useVerifyOtp = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (payload: { email: string; otp: string }) => {
      const { data } = await verifyOtpApi(payload);
      return data;
    },
    onSuccess: (response: { message: string }) => {
      openNotificationWithIcon(
        NotificationTypeEnum.SUCCESS,
        response.message || "Xác thực OTP thành công",
      );
      navigate("/login");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      openNotificationWithIcon(
        NotificationTypeEnum.ERROR,
        error.response?.data?.message ?? "OTP không hợp lệ",
      );
    },
  });
};

export const useResendOtp = () => {
  return useMutation({
    mutationFn: async (payload: { email: string }) => {
      const { data } = await resendOtpApi(payload);
      return data;
    },
    onSuccess: (response: { message: string }) => {
      openNotificationWithIcon(
        NotificationTypeEnum.SUCCESS,
        response.message || "Đã gửi lại mã OTP",
      );
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      openNotificationWithIcon(
        NotificationTypeEnum.ERROR,
        error.response?.data?.message ?? "Không thể gửi lại OTP",
      );
    },
  });
};
