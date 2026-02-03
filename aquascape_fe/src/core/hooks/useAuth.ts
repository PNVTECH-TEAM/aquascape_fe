import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { registerApi } from "@app/core/services";
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
    onSuccess: (response: { message: string }) => {
      openNotificationWithIcon(
        NotificationTypeEnum.SUCCESS,
        response.message || "Đăng ký thành công",
      );
      navigate("/login");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      openNotificationWithIcon(
        NotificationTypeEnum.ERROR,
        error.response?.data?.message ?? "Đăng ký thất bại",
      );
    },
  });
};
