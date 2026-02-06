import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { registerLogin } from "@app/assets/images";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLoginSchema } from "./LoginSchema";
import { useLogin } from "@app/core/hooks/useAuth";
import type { LoginPayload } from "@app/core/interface";

const LoginForm = () => {
  const loginSchema = useLoginSchema();
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const { mutate: login, isPending } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginPayload>({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginPayload) => {
    login({
      email: data.email,
      password: data.password,
    });
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="w-full bg-white shadow-lg flex flex-col flex-1">
        <div className="w-full">
          <img
            src={registerLogin}
            alt="Aquascape"
            className="w-full h-full object-cover"
          />
        </div>

        <div
          className="
            -mt-[20px]
            bg-white
            relative
            z-10
            rounded-tl-[20px]
            rounded-tr-[20px]
            px-4
            flex flex-col flex-1
          "
        >
          <div className="text-center mb-3 pt-3">
            <h2 className="text-2xl font-bold text-blue-600">
              {t("LOGIN.REQUIREMENT.TITLE")}
            </h2>

            <span className="block text-sm text-gray-400">
              {t("LOGIN.REQUIREMENT.CONTENTTITLE")}
            </span>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 flex-1">
            <div>
              <label className="block text-sm font-bold text-gray-900">
                {t("LOGIN.REQUIREMENT.EMAIL")}
              </label>

              <input
                {...register("email")}
                placeholder="Email"
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              {errors.email && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900">
                {t("LOGIN.REQUIREMENT.PASSWORD")}
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  placeholder="Password"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>

              {errors.password && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-xl bg-blue-600 py-2 text-white font-bold hover:bg-blue-700 disabled:opacity-60"
            >
              {isPending
                ? t("LOGIN.REQUIREMENT.LOADING")
                : t("LOGIN.REQUIREMENT.BUTTONLOGIN")}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4 pb-4">
            {t("LOGIN.REQUIREMENT.CONTENTREGISTER")}{" "}
            <Link to="/register" className="text-blue-600 font-bold">
              {t("LOGIN.REQUIREMENT.REGISTER")}
            </Link>
          </p>

          <p className="mt-auto text-center text-sm text-gray-500 pb-4"></p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
