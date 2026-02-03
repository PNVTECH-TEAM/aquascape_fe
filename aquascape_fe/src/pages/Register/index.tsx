import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import "./Register.scss";
import { registerLogin } from "@app/assets/images";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSignUpSchema } from "./RegisterSchema";
import { useRegister } from "@app/core/hooks/useAuth";
import type { RegisterPayload } from "@app/core/interface";
import RegisterNavigate from "@app/navigate/RegisterNavigate";

const RegisterForm = () => {
  const signUpSchema = useSignUpSchema();
  const registerMutation = useRegister();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterPayload>({
    resolver: yupResolver(signUpSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
    },
  });
  const [showPassword, setShowPassword] = useState(false);
  const { t } = useTranslation();
  const onSubmit = (data: RegisterPayload) => {
    registerMutation.mutate({
      fullName: data.fullName,
      email: data.email,
      password: data.password,
    });
  };

  return (
    <div className="h-screen bg-gray-100 flex items-center justify-center">
      <div className="w-full max-w-sm bg-white shadow-lg flex flex-col">
        <div className="w-full md:w-1/2 aspect-[1] -mt-[10px]">
          <img
            src={registerLogin}
            alt="Aquascape"
            className="w-full h-full object-cover object-center -mt-[10px]"
          />
        </div>

        <div
          className="
            px-3
            -mt-[70px]
            bg-white
            relative
            z-10
            rounded-tl-[20px]
            rounded-tr-[20px]
          "
        >
          <h2 className="text-center text-xl font-semibold text-blue-600 py-2">
            Register
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-900">
                {t("REGISTER.REQUIREMENT.FULL_NAME")}
              </label>
              <input
                {...register("fullName")}
                placeholder="Full name"
                className="w-full rounded-xl border border-gray-200 px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.fullName && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900">
                {t("REGISTER.REQUIREMENT.EMAIL")}
              </label>
              <input
                {...register("email")}
                placeholder="Email"
                className="w-full rounded-xl border border-gray-200 px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900">
                {t("REGISTER.REQUIREMENT.PASSWORD")}
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  placeholder="Password"
                  className="w-full rounded-xl border border-gray-200 px-2 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
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
              disabled={registerMutation.isPending}
              className="w-full rounded-xl bg-blue-600 py-2 text-white font-bold hover:bg-blue-700 transition disabled:opacity-50"
            >
              {registerMutation.isPending
                ? "Registering..."
                : t("REGISTER.REQUIREMENT.BUTTONREGISTER")}
            </button>
          </form>

          <p className="mt-1 text-center text-sm text-gray-500">
            {t("REGISTER.REQUIREMENT.CONTENTREGISTER")}
            <RegisterNavigate />
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
