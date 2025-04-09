import { useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { SignupForm } from "@/components/auth/SignupForm";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function SignupPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);
  
  return (
    <Layout>
      <div className="container mx-auto py-10 px-4">
        <div className="max-w-md mx-auto">
          <div className="flex justify-center mb-6">
            <img src="/lovable-uploads/ecg-logo.png" alt="ECG Logo" className="h-16 w-auto" />
          </div>
          <h1 className="text-2xl font-bold mb-6 text-center">Sign Up for ECG Fault Master</h1>
          <SignupForm />
        </div>
      </div>
    </Layout>
  );
}
