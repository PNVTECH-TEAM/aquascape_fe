// hooks/useLogin.ts
import { useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import { userAPI } from "@app/core/services/userAPI";
import { setStorageData } from "@app/core/config/storage";
import { login } from "@app/core/redux/features/auth/authSlice";
import { ACCESS_TOKEN } from "@app/core/constants";

export const useLogin = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: userAPI.login,
    onSuccess: (res: any) => {
      console.log("LOGIN RESPONSE:", res);

      const token = res?.data?.token ?? res?.token;

      if (!token) {
        alert("Login thành công nhưng không nhận được token");
        return;
      }

      setStorageData(ACCESS_TOKEN, token);
      dispatch(login());
      navigate("/");
    },
    onError: (error: any) => {
      console.error("LOGIN ERROR:", error);

      const message =
        error?.response?.status === 401
          ? "Email hoặc mật khẩu không đúng"
          : "Đăng nhập thất bại, vui lòng thử lại";

      alert(message);
    },
  });
};
