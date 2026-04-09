import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Eye, EyeOff, Loader2, UserRound } from "lucide-react";
import { Button } from "@components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@components/ui/form";
import { Input } from "@components/ui/input";
import { useToast } from "@hooks/use-toast";
import { authService } from "@services/authService";
import { getPostLoginPath, preloadPostLoginRoute } from "@lib/authRedirect";
import { useAuthStore } from "@store/useAuthStore";

const completeProfileSchema = z.object({
  fullName: z.string().trim().min(2, "Name is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type CompleteProfileValues = z.infer<typeof completeProfileSchema>;

const CompleteGoogleProfilePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<CompleteProfileValues>({
    resolver: zodResolver(completeProfileSchema),
    defaultValues: {
      fullName: user?.fullName || "",
      password: "",
    },
  });

  useEffect(() => {
    if (user?.hasPassword) {
      navigate(getPostLoginPath(user), { replace: true });
    }
  }, [navigate, user]);

  const onSubmit = async (values: CompleteProfileValues) => {
    try {
      setError(null);
      const response = await authService.completeGoogleProfile(values.fullName, values.password);
      setUser(response.user);
      await preloadPostLoginRoute(response.user);
      toast({
        title: "Profile completed",
        description: "Your Google account is ready to use.",
      });
      navigate(getPostLoginPath(response.user), { replace: true });
    } catch (submissionError) {
      const message = submissionError instanceof Error ? submissionError.message : "Could not complete your profile.";
      setError(message);
      toast({
        title: "Profile update failed",
        description: message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0A1E] text-white flex items-center justify-center p-6">
      <Card className="w-full max-w-lg border-white/10 bg-slate-950/80 shadow-2xl shadow-violet-950/40">
        <CardHeader className="space-y-4">
          <div className="flex items-center gap-3 text-violet-300">
            <UserRound className="h-10 w-10 rounded-full bg-violet-500/10 p-2" />
            <div>
              <CardTitle className="font-poppins text-2xl text-white">Complete your profile</CardTitle>
              <CardDescription className="text-slate-300">
                Add your name and password to finish your Google sign-in.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Google email</p>
                <p className="mt-2 break-all text-lg font-medium text-white">{user?.email || "Loading..."}</p>
              </div>

              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-200">Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value || ""}
                        placeholder="Enter your full name"
                        className="h-12 rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-slate-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-200">Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          value={field.value || ""}
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a password"
                          className="h-12 rounded-2xl border-white/10 bg-white/5 pr-12 text-white placeholder:text-slate-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((current) => !current)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-violet-300"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full h-12 rounded-2xl bg-violet-600 text-white hover:bg-violet-500"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save and continue"}
              </Button>

              {error ? <p className="text-sm text-red-400">{error}</p> : null}
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompleteGoogleProfilePage;
