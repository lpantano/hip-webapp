import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const MailingListSignup = () => {
  const [email, setEmail] = useState("");

  const handleMailingList = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: wire to real mailing list service
    console.log("Mailing list signup:", email);
    setEmail("");
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
        />
        <Button type="submit" className="bg-white text-primary hover:bg-white/90 px-6">
          Subscribe
        </Button>
      </form>
    </div>
  );
};

export default MailingListSignup;
