import Header from "@/components/layout/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Legal = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20">
      <Header />
      <main className="container mx-auto px-6 pt-32 pb-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl text-center font-bold bg-hero-gradient bg-clip-text text-transparent mb-8">Legal Information</h1>

          <Tabs defaultValue="terms" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-card/60 border border-border">
              <TabsTrigger value="terms" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                Terms of Service
              </TabsTrigger>
              <TabsTrigger value="privacy" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                Privacy Policy
              </TabsTrigger>
            </TabsList>

            <TabsContent value="terms" className="mt-6">
              <div className="bg-card border border-border rounded-lg p-8 space-y-6 text-foreground">
                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">Platform Purpose</h2>
                  <p className="mb-4">
                    HealthIntegrityProject is an educational platform that provides research-backed affirmations
                    and insights specifically focused on women's experiences, health, and empowerment. Our mission is to
                    bridge the gap between scientific research and practical self-empowerment tools.
                  </p>
                </section>



                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">Data Usage Terms</h2>
                  <p className="mb-4">By using our platform, you agree that:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Research data is for educational and personal empowerment purposes only</li>
                    <li>Information should not replace professional medical or psychological advice</li>
                    <li>You will not misrepresent or misuse the research findings</li>
                    <li>Attribution to original research sources is required for any sharing</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">User Responsibilities</h2>
                  <p className="mb-4">Users are expected to:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Use the platform respectfully and in accordance with its educational purpose</li>
                    <li>Understand that research findings are generalizations and may not apply to every individual</li>
                    <li>Consult healthcare professionals for medical concerns</li>
                    <li>Report any technical issues or content concerns promptly</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">Limitation of Liability</h2>
                  <p className="mb-4">
                    While we strive for accuracy, this platform is for educational purposes only. We are not liable for:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Individual outcomes based on research findings</li>
                    <li>Decisions made using platform information</li>
                    <li>Changes in research consensus over time</li>
                    <li>Technical issues or service interruptions</li>
                  </ul>
                </section>



                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">Updates and Changes</h2>
                  <p className="mb-4">
                    We reserve the right to update these terms as our platform evolves. Users will be notified of
                    significant changes, and continued use constitutes acceptance of updated terms.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">Contact</h2>
                  <p>
                    For questions about these terms or our data usage policies, contact us at{" "}
                    <a href="mailto:legal@healthintegrityproject.org" className="text-accent hover:underline">
                      legal@healthintegrityproject.org
                    </a>
                  </p>
                </section>

                <div className="border-t border-border pt-6 mt-8">
                  <p className="text-sm text-foreground/70">
                    Last updated: {new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="privacy" className="mt-6">
              <div className="bg-card border border-border rounded-lg p-8 space-y-6 text-foreground">
                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">Data Collection</h2>
                  <p className="mb-4">
                    We collect minimal personal information necessary to provide our research platform services. This includes:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Email address for account creation and communication</li>
                    <li>Usage analytics to improve our research tools</li>
                    <li>Research preferences and saved health claims</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">How We Use Your Data</h2>
                  <p className="mb-4">Your information is used to:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Provide personalized research-backed health claims</li>
                    <li>Improve our platform's educational content</li>
                    <li>Send important updates about new research findings</li>
                    <li>Maintain platform security and prevent abuse</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">Data Protection</h2>
                  <p className="mb-4">
                    We implement industry-standard security measures to protect your personal information:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Encrypted data transmission and storage</li>
                    <li>Regular security audits and updates</li>
                    <li>Limited access to personal data on a need-to-know basis</li>
                    <li>Compliance with GDPR and CCPA regulations</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">Your Rights</h2>
                  <p className="mb-4">You have the right to:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Access your personal data</li>
                    <li>Request data correction or deletion</li>
                    <li>Opt out of non-essential communications</li>
                    <li>Download your data in a portable format</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">Research Ethics</h2>
                  <p className="mb-4">
                    Our platform is committed to ethical research practices. All research cited on our platform:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Has been peer-reviewed and published in reputable journals</li>
                    <li>Follows ethical research standards and IRB approval</li>
                    <li>Respects participant privacy and consent</li>
                    <li>Is presented with transparent methodology and limitations</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">Contact Us</h2>
                  <p>
                    If you have questions about this Privacy Policy or your data, please contact us at{" "}
                    <a href="mailto:legal@healthintegrityproject.org" className="text-accent hover:underline">
                      legal@healthintegrityproject.org
                    </a>
                  </p>
                </section>

                <div className="border-t border-border pt-6 mt-8">
                  <p className="text-sm text-foreground/70">
                    Last updated: {new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Legal;
