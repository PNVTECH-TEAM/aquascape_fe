import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Mail } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useResendOtp, useVerifyOtp } from "@app/core/hooks";

const OTP_LENGTH = 6;
const RESEND_TIME = 180;

export default function OTPVerification() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const email: string | undefined =
    location.state?.email || localStorage.getItem("verify_email") || undefined;

  useEffect(() => {
    if (!email) navigate("/register");
  }, [email, navigate]);

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [timeLeft, setTimeLeft] = useState(RESEND_TIME);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const canResend = timeLeft === 0;

  const { mutate: verifyOtp, isPending: isVerifying } = useVerifyOtp();
  const { mutate: resendOtp, isPending: isResending } = useResendOtp();

  useEffect(() => {
    if (!timeLeft) return;
    const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft]);

  const handleInputChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;

    const next = [...otp];
    next[index] = value;
    setOtp(next);

    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text").slice(0, OTP_LENGTH);
    if (!/^\d+$/.test(pasted)) return;

    setOtp(pasted.split(""));
    inputRefs.current[OTP_LENGTH - 1]?.focus();
  };

  const handleVerify = () => {
    const code = otp.join("");
    if (code.length !== OTP_LENGTH || !email) return;
    verifyOtp({ email, otp: code });
  };

  const handleResend = () => {
    if (!canResend || isResending || !email) return;
    resendOtp({ email });
    setOtp(Array(OTP_LENGTH).fill(""));
    setTimeLeft(RESEND_TIME);
    inputRefs.current[0]?.focus();
  };
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  if (!email) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center px-4">
      <div className="">
        <button
          onClick={() => navigate("/register")}
          className="absolute left-4 top-4 text-gray-500 hover:text-black"
        >
          <ArrowLeft size={22} />
        </button>

        <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mt-4">
          <Mail className="text-blue-600" />
        </div>

        <h1 className="mt-6 text-center text-2xl font-bold text-gray-800">
          {t("OTP_VERIFY.TITLE")}
        </h1>

        <p className="mt-3 text-center text-sm text-gray-600 leading-relaxed">
          {t("OTP_VERIFY.DESCRIPTION.LINE_1")}
          <br />
          <span className="font-medium text-gray-900">{email}</span>
          <br />
          {t("OTP_VERIFY.DESCRIPTION.LINE_2")}
        </p>

        <div className="flex justify-center gap-3 mt-8">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              value={digit}
              maxLength={1}
              disabled={isVerifying}
              onChange={(e) => handleInputChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={index === 0 ? handlePaste : undefined}
              className="
                w-12 h-14
                text-center text-xl font-semibold
                rounded-xl
                border border-gray-300
                focus:border-blue-500
                focus:ring-2 focus:ring-blue-200
                outline-none
                disabled:bg-gray-100
              "
            />
          ))}
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          {t("OTP_VERIFY.RESEND.QUESTION")}
        </p>

        <button
          onClick={handleResend}
          disabled={!canResend || isResending}
          className={`
            w-full mt-3 py-3 rounded-full font-semibold text-white transition
            ${
              canResend && !isResending
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-blue-300 cursor-not-allowed"
            }
          `}
        >
          {isResending
            ? t("OTP_VERIFY.RESEND.SENDING")
            : canResend
              ? t("OTP_VERIFY.RESEND.BUTTON")
              : t("OTP_VERIFY.RESEND.BUTTON_COUNTDOWN", {
                  time: formatTime(timeLeft),
                })}
        </button>

        <button
          onClick={handleVerify}
          disabled={isVerifying || otp.some((d) => !d)}
          className="
            w-full mt-4 py-3 rounded-full
            bg-green-600 hover:bg-green-700
            text-white font-semibold
            disabled:opacity-60
          "
        >
          {isVerifying
            ? t("OTP_VERIFY.VERIFY.VERIFYING")
            : t("OTP_VERIFY.VERIFY.BUTTON")}
        </button>
      </div>
    </div>
  );
}
