import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const MailingListSignup = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  

  const handleMailingList = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    // Basic client-side normalization and validation
    const normalized = (email || "").trim().toLowerCase();
    const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!EMAIL_RE.test(normalized) || normalized.length > 254) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("mailing_list_signups").insert({ email: normalized });
    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      setEmail("");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-lg mx-auto text-center">
      <form onSubmit={handleMailingList} className="flex flex-col sm:flex-row gap-3 items-center justify-center">
        <Input
          type="email"
          placeholder="your-email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full sm:w-64 bg-white/10 border-white/30 text-white placeholder:text-white/70"
          required
          disabled={loading}
        />
        <Button type="submit" className="bg-white text-primary hover:bg-white/90 px-6" disabled={loading}>
          {loading ? "Submitting..." : "Subscribe"}
        </Button>
      </form>
      {success && <div className="text-white mt-2">Thank you for subscribing!</div>}
      {error && <div className="text-red-400 mt-2">{error}</div>}
    </div>
  );
};

export default MailingListSignup;
