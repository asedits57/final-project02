import { useCallback, useEffect, useMemo, useRef, useState, type ClipboardEvent, type KeyboardEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AlertCircle, CheckCircle2, Loader2, MailCheck, RefreshCw } from "lucide-react";
import { Button } from "@components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@components/ui/alert";
import { useToast } from "@hooks/use-toast";
import { authService, type OtpSessionResponse } from "@services/authService";
import { clearOtpSession, getOtpSession, setOtpSession } from "@lib/otpSession";
import { useAuthStore } from "@store/useAuthStore";
import { getPostLoginPath, preloadPostLoginRoute } from "@lib/authRedirect";

const formatDuration = (totalSeconds: number) => {
  const safeSeconds = Math.max(0, totalSeconds);
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};

const VerifyOtpPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  const storedSession = getOtpSession();
  const queryRequestId = searchParams.get("requestId");

  const [requestId, setRequestId] = useState(queryRequestId || storedSession?.requestId || "");
  const [email, setEmail] = useState(storedSession?.email || user?.email || "");
  const [expiresAt, setExpiresAt] = useState(storedSession?.expiresAt || "");
  const [resendAvailableAt, setResendAvailableAt] = useState(storedSession?.resendAvailableAt || "");
  const [otpDigits, setOtpDigits] = useState<string[]>(() => Array(6).fill(""));
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPreparing, setIsPreparing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [now, setNow] = useState(Date.now());
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (user?.isVerified && user?.hasPassword) {
      clearOtpSession();
      navigate(getPostLoginPath(user), { replace: true });
    }
    if (user?.isVerified && user?.hasPassword === false) {
      clearOtpSession();
      navigate("/complete-profile", { replace: true });
    }
  }, [navigate, user]);

  const expiresInSeconds = useMemo(() => {
    if (!expiresAt) {
      return 0;
    }

    return Math.max(0, Math.ceil((new Date(expiresAt).getTime() - now) / 1000));
  }, [expiresAt, now]);

  const resendInSeconds = useMemo(() => {
    if (!resendAvailableAt) {
      return 0;
    }

    return Math.max(0, Math.ceil((new Date(resendAvailableAt).getTime() - now) / 1000));
  }, [now, resendAvailableAt]);

  const otpValue = otpDigits.join("");

  const applyOtpSession = useCallback((response: OtpSessionResponse) => {
    const nextSession = {
      requestId: response.requestId,
      email: response.email,
      expiresAt: response.expiresAt,
      resendAvailableAt: response.resendAvailableAt,
    };

    setOtpSession(nextSession);
    setRequestId(response.requestId);
    setEmail(response.email);
    setExpiresAt(response.expiresAt);
    setResendAvailableAt(response.resendAvailableAt);
    setOtpDigits(Array(6).fill(""));
    navigate(`/verify-otp?requestId=${encodeURIComponent(response.requestId)}`, { replace: true });
  }, [navigate]);

  useEffect(() => {
    let isCancelled = false;

    const bootstrapRequest = async () => {
      if (!user?.email) {
        return;
      }

      setEmail(user.email);

      const latestStoredSession = getOtpSession();
      const activeRequestId = queryRequestId || latestStoredSession?.requestId;
      const canReuseStoredSession =
        !!latestStoredSession &&
        !!latestStoredSession.requestId &&
        (!activeRequestId || latestStoredSession.requestId === activeRequestId);

      if (canReuseStoredSession) {
        setRequestId(latestStoredSession.requestId);
        setEmail(latestStoredSession.email || user.email);
        setExpiresAt(latestStoredSession.expiresAt);
        setResendAvailableAt(latestStoredSession.resendAvailableAt);
        setOtpDigits(Array(6).fill(""));
        return;
      }

      setIsPreparing(true);
      setError(null);

      try {
        const response = activeRequestId
          ? await authService.getOtpSession(activeRequestId)
          : await authService.sendOtp(user.email);

        if (isCancelled) {
          return;
        }

        applyOtpSession(response);
        setSuccess(
          activeRequestId
            ? "Enter the verification code we already sent to your Google email."
            : "We sent a verification code to your Google email.",
        );
      } catch (err: unknown) {
        if (!isCancelled) {
          setError(getErrorMessage(err, "We could not prepare your verification code."));
        }
      } finally {
        if (!isCancelled) {
          setIsPreparing(false);
        }
      }
    };

    void bootstrapRequest();

    return () => {
      isCancelled = true;
    };
  }, [applyOtpSession, queryRequestId, user?.email]);

  const handleOtpDigitChange = (index: number, rawValue: string) => {
    const nextValue = rawValue.replace(/\D/g, "").slice(-1);
    const currentDigits = [...otpDigits];

    currentDigits[index] = nextValue;
    setOtpDigits(currentDigits);
    if (error) {
      setError(null);
    }

    if (nextValue && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (event.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (event.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (event: ClipboardEvent<HTMLInputElement>) => {
    const pastedDigits = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);

    if (!pastedDigits) {
      return;
    }

    event.preventDefault();
    setOtpDigits(Array.from({ length: 6 }, (_, index) => pastedDigits[index] || ""));
    if (error) {
      setError(null);
    }

    const nextFocusIndex = Math.min(pastedDigits.length, 5);
    inputRefs.current[nextFocusIndex]?.focus();
  };

  const handleVerify = async () => {
    if (!requestId) {
      setError("A verification request is missing. Request a new code.");
      return;
    }

    if (otpValue.length !== 6) {
      setError("Enter the 6-digit OTP.");
      return;
    }

    setIsVerifying(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await authService.verifyOtp(requestId, otpValue);
      if (response.user) {
        setUser(response.user);
      }

      clearOtpSession();
      setSuccess(response.message);
      toast({
        title: "Verification successful",
        description: "Your Google email has been verified.",
      });

      if (response.requiresProfileCompletion || response.user?.hasPassword === false) {
        navigate("/complete-profile", { replace: true });
        return;
      }

      const resolvedUser = response.user || user;
      await preloadPostLoginRoute(resolvedUser);
      navigate(getPostLoginPath(resolvedUser), { replace: true });
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Invalid or expired OTP"));
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!user?.email) {
      setError("Your authenticated Google email is unavailable.");
      return;
    }

    setIsResending(true);
    setError(null);
    setSuccess(null);

    try {
      const response = requestId
        ? await authService.resendOtp(requestId)
        : await authService.sendOtp(user.email);

      applyOtpSession(response);
      setOtpDigits(Array(6).fill(""));
      setSuccess("A new verification code has been sent to your Google email.");
      toast({
        title: "OTP Sent",
        description: "We sent a verification code to your Google email.",
      });
    } catch (err: unknown) {
      setError(getErrorMessage(err, "We could not resend the verification code."));
    } finally {
      setIsResending(false);
    }
  };

  const isExpired = !!expiresAt && expiresInSeconds === 0;
  const isBusy = isPreparing || isVerifying || isResending;

  return (
    <div className="min-h-screen bg-[#0F0A1E] text-white flex items-center justify-center p-6">
      <Card className="w-full max-w-lg border-white/10 bg-slate-950/80 shadow-2xl shadow-violet-950/40">
        <CardHeader className="space-y-4">
          <div className="flex items-center gap-3 text-violet-300">
            <MailCheck className="h-10 w-10 rounded-full bg-violet-500/10 p-2" />
            <div>
              <CardTitle className="font-poppins text-2xl text-white">Verify your Google email</CardTitle>
              <CardDescription className="text-slate-300">
                We sent a verification code to your Google email
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Authenticated email</p>
            <p className="mt-2 break-all text-lg font-medium text-white">{email || user?.email || "Loading..."}</p>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-slate-200">Enter the 6-digit OTP</p>
            <div className="grid grid-cols-6 gap-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <input
                  key={index}
                  ref={(element) => {
                    inputRefs.current[index] = element;
                  }}
                  type="text"
                  inputMode="numeric"
                  autoComplete={index === 0 ? "one-time-code" : "off"}
                  maxLength={1}
                  value={otpDigits[index] || ""}
                  onChange={(event) => handleOtpDigitChange(index, event.target.value)}
                  onKeyDown={(event) => handleOtpKeyDown(index, event)}
                  onPaste={handleOtpPaste}
                  disabled={isBusy || isExpired}
                  className="h-12 w-full rounded-xl border border-white/10 bg-slate-900/70 text-center text-lg font-semibold text-white outline-none transition focus:border-violet-400 disabled:cursor-not-allowed disabled:opacity-60"
                />
              ))}
            </div>
          </div>

          <div className="grid gap-3 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Code expires in</p>
              <p className="mt-2 text-xl font-semibold text-white">{formatDuration(expiresInSeconds)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Resend available in</p>
              <p className="mt-2 text-xl font-semibold text-white">{formatDuration(resendInSeconds)}</p>
            </div>
          </div>

          {isExpired && (
            <Alert variant="destructive" className="border-red-500/40 bg-red-950/30 text-red-100">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Code expired</AlertTitle>
              <AlertDescription>Code expired. Request a new one.</AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive" className="border-red-500/40 bg-red-950/30 text-red-100">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Verification failed</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && !error && (
            <Alert className="border-emerald-500/30 bg-emerald-950/20 text-emerald-100">
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              type="button"
              className="flex-1 bg-violet-600 text-white hover:bg-violet-500"
              onClick={handleVerify}
              disabled={isPreparing || isVerifying || otpValue.length !== 6 || isExpired || !requestId}
            >
              {isVerifying ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Verify
            </Button>

            <Button
              type="button"
              variant="outline"
              className="flex-1 border-white/10 bg-white/5 text-white hover:bg-white/10"
              onClick={handleResend}
              disabled={isResending || resendInSeconds > 0}
            >
              {isResending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Resend OTP
            </Button>
          </div>

          {isPreparing && (
            <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              Preparing your verification request...
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyOtpPage;
