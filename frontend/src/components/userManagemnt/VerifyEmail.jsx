import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/user";
import { toast } from "react-hot-toast";
import { X, CheckCircle } from "lucide-react";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const closeToHome = () => navigate("/");
  const stop = (e) => e.stopPropagation();

  const { error, isLoading, verifyEmail } = useAuthStore();

  const inputsRef = useRef([]);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isSuccess, setIsSuccess] = useState(false);

  const focusAt = (i) => inputsRef.current[i]?.focus();

  const handleChange = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[i] = val;
    setOtp(next);
    if (val && i < 5) focusAt(i + 1);
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) focusAt(i - 1);
    if (e.key === "ArrowLeft" && i > 0) focusAt(i - 1);
    if (e.key === "ArrowRight" && i < 5) focusAt(i + 1);
  };

  const handlePaste = (e) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!text) return;
    const next = [...otp];
    for (let i = 0; i < 6; i++) next[i] = text[i] || "";
    setOtp(next);
    focusAt(Math.min(text.length, 5));
    e.preventDefault();
  };

  const submit = async (e) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length !== 6) {
      toast.error("Please enter the 6-digit code");
      return;
    }

    try {
      await verifyEmail(code);
      setIsSuccess(true);
      toast.success("Email verified successfully");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      console.log(err);
      toast.error("Verification failed");
    }
  };

  return (
    <div className="fixed inset-0 flex z-50" onClick={closeToHome}>
      {/* Left Side (background like Register) */}
      <div className="hidden lg:flex lg:w-3/5 relative">
        <img
          src="/images/bckg.jpg"
          alt="fashion background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/90 to-black/80 opacity-90"></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-8">
          <h1 className="text-4xl font-bold mb-4">Secure Verification</h1>
          <p className="max-w-md text-gray-300">
            Enter the code we sent to your email to confirm your account.
          </p>
        </div>
      </div>

      {/* Right Form Panel */}
      <aside
        onClick={stop}
        className="w-full lg:w-2/5 bg-white flex flex-col relative overflow-y-auto p-6 sm:p-8 shadow-2xl"
      >
        <button
          onClick={closeToHome}
          className="absolute top-6 right-6 z-20 p-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-full transition-all duration-200"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-md bg-white p-6 rounded-xl shadow-md text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Verify Your Email
            </h2>
            {!isSuccess ? (
              <>
                <p className="text-gray-600 mb-6">
                  We sent a 6-digit code to your email. Enter it below to
                  continue.
                </p>

                <form className="space-y-6" onSubmit={submit}>
                  <div
                    onPaste={handlePaste}
                    className="flex justify-center gap-3 mb-2"
                  >
                    {otp.map((v, i) => (
                      <input
                        key={i}
                        ref={(el) => (inputsRef.current[i] = el)}
                        inputMode="numeric"
                        maxLength={1}
                        value={v}
                        onChange={(e) => handleChange(i, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(i, e)}
                        className="w-12 h-14 text-center text-lg border-2 rounded-lg focus:outline-none focus:border-yellow-400 transition-all duration-200 disabled:bg-gray-100"
                        disabled={isLoading}
                      />
                    ))}
                  </div>

                  <div className="text-sm text-gray-500">
                    Didn’t get the code?{" "}
                    <button
                      type="button"
                      onClick={() => toast.success("Resent!")}
                      className="text-yellow-600 hover:underline"
                      disabled={isLoading}
                    >
                      Resend
                    </button>
                  </div>

                  {error && <p className="text-red-600">{error}</p>}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-800 font-bold py-3 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg"
                  >
                    {isLoading ? "Verifying..." : "Confirm"}
                  </button>
                </form>
              </>
            ) : (
              <div className="mt-6">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
                <p className="text-gray-600">
                  Email verified successfully! Redirecting to login...
                </p>
              </div>
            )}

            <div className="mt-6">
              <button
                type="button"
                onClick={() => navigate("/register")}
                className="text-yellow-600 hover:underline text-sm font-medium"
                disabled={isLoading}
              >
                Go back to registration
              </button>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default VerifyEmail;
