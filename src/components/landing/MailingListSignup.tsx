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
    <div className="max-w-2xl mx-auto text-center mt-4">
      {/* <Card className="bg-hero-gradient text-white border-0"> */}
        <CardHeader>
          {/* <CardTitle className="text-2xl">Stay Updated</CardTitle> */}
          <p className="text-white/90">
            Get notified about new expert reviews, platform updates, and women's health insights
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleMailingList} className="flex flex-col sm:flex-row gap-4">
            <Input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-white/10 border-white/30 text-white placeholder:text-white/70"
              required
            />
            <Button type="submit" className="bg-white text-primary hover:bg-white/90 px-8">
              Join Mailing List
            </Button>
          </form>
        </CardContent>
      {/* </Card> */}
    </div>
  );
};

export default MailingListSignup;
