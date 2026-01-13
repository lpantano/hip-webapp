import Header from "@/components/layout/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Legal = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20">
      <Header />
      <main className="container mx-auto px-6 pt-24 pb-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl text-center sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 pb-2 leading-[1.15] overflow-visible bg-hero-gradient bg-clip-text text-transparent">
            Legal Information
          </h1>

          <Tabs defaultValue="privacy" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-card/60 border border-border">
              <TabsTrigger value="privacy" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                Privacy Policy
              </TabsTrigger>
              <TabsTrigger value="cookies" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                Cookie Policy
              </TabsTrigger>
              <TabsTrigger value="terms" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                Terms of Service
              </TabsTrigger>
            </TabsList>

            <TabsContent value="privacy" className="mt-6">
              <div className="bg-card border border-border rounded-lg p-8 space-y-6 text-foreground">
                <section className="border-b border-border pb-6">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">TL;DR</h2>
                  <div className="space-y-3 text-sm">
                    <p>
                      We started this project because we care about data and science integrity, transparency
                      and making that information available for people. We value data privacy as much as
                      this project and consider protecting your data an absolute must.
                    </p>
                    <p>
                      <strong>You do not have to provide personal information like your real name, address, or date of birth</strong> to sign up for a regular user account. For experts and researchers who create content, we require personal information to validate credentials—this is fundamental to keeping this project integral.
                    </p>
                    <p>
                      <strong>We do not sell or rent your information to anybody.</strong> We keep the amount of data we collect and the number of third parties involved to the minimum necessary to run this site and make it better for you.
                    </p>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">About this Privacy Notice</h2>
                  <p className="mb-4">
                    This Privacy Policy applies to the personal information we collect about you through
                    our website or when you communicate with us.
                  </p>
                  <p className="mb-4">
                    You have rights in relation to how we use your personal information.
                  </p>
                  <p className="mb-4">
                    By using our website, <strong>you represent that you are at least 16 years of age.</strong> We do not
                    knowingly advertise to, or collect personal information from, any individual under the
                    age of 16. If we become aware that we have collected personal information from you
                    and you are under the age of 16, we will suspend any services and delete your personal information immediately.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">Personal Information We Collect</h2>
                  <p className="mb-4">
                    We collect the following kinds of personal information from you:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Account login and contact details such as your name and email address</li>
                    <li>For experts: picture, expertise area, years of experience, location, personal website/company name, education credentials</li>
                    <li>Website and social media details such as Instagram handles, profile names you choose to give us</li>
                    <li>Images, photos, user generated content</li>
                    <li>Device information such as IP address, device ID and type, device location, website activity logs, network access, referrer, domain, browser type, language, previously visited pages, interaction through click behavior, country, time zone</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">How We Use Your Data</h2>
                  <p className="mb-4">We collect personal information to:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Provide you with our services and personalized content</li>
                    <li>Update you with new content on our website and via email (with your consent)</li>
                    <li>Engage with you on social media</li>
                    <li>Review applications for expert/researcher recruitment</li>
                    <li>Improve and optimize our website</li>
                    <li>Collect survey feedback to improve content</li>
                    <li>Respond to your inquiries and provide customer support</li>
                    <li>Conduct research and diagnostics to enhance user experience</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">Cookies & Metadata</h2>
                  <p className="mb-4">
                    We use cookies and similar technologies to understand how you use our site and to provide
                    essential features. Metadata collection helps improve your user experience. For more details,
                    see our Cookie Policy.
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>Cookies:</strong> We use essential cookies for authentication and site functionality</li>
                    <li><strong>IP Addresses:</strong> Automatically received to determine geographical location</li>
                    <li><strong>Browser Data:</strong> Device type, browser version, language preference, operating system</li>
                    <li><strong>Local Storage:</strong> Session storage for delivering services as requested</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">Third-Party Services</h2>
                  <p className="mb-4">
                    We share the minimum amount of your personal information with third-party service providers
                    necessary to operate our site. These providers have their own privacy policies.
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border border-border rounded-lg">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="px-4 py-3 text-left font-semibold">Third Party</th>
                          <th className="px-4 py-3 text-left font-semibold">Purpose</th>
                          <th className="px-4 py-3 text-left font-semibold">Privacy Policy</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        <tr>
                          <td className="px-4 py-3">Supabase</td>
                          <td className="px-4 py-3">Database services</td>
                          <td className="px-4 py-3">
                            <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                              View Policy
                            </a>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3">Google Inc</td>
                          <td className="px-4 py-3">Authentication</td>
                          <td className="px-4 py-3">
                            <a href="https://www.google.com/intl/en/policies/privacy/" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                              View Policy
                            </a>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3">Zoho Email</td>
                          <td className="px-4 py-3">Email communications</td>
                          <td className="px-4 py-3">
                            <a href="https://www.zoho.com/privacy.html" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                              View Policy
                            </a>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3">Netlify</td>
                          <td className="px-4 py-3">Website hosting</td>
                          <td className="px-4 py-3">
                            <a href="https://www.netlify.com/privacy/" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                              View Policy
                            </a>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">Your Rights</h2>
                  <p className="mb-4">You have the right to:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>Access your personal data</strong> - Request a copy of the information we hold about you</li>
                    <li><strong>Request data correction or deletion</strong> - Update inaccurate information or ask us to delete your data</li>
                    <li><strong>Data portability</strong> - Request your personal information in a portable, machine-readable format</li>
                    <li><strong>Opt out of communications</strong> - Unsubscribe from non-essential emails and notifications</li>
                    <li><strong>Object or restrict processing</strong> - Challenge how we process your data in certain circumstances</li>
                    <li><strong>Withdraw consent</strong> - Remove your consent for data processing at any time</li>
                  </ul>
                  <p className="mt-4">
                    To exercise any of these rights, contact us via the link in our website footer or email us directly.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">Security & Data Protection</h2>
                  <p className="mb-4">
                    We take all reasonable security measures to protect your personal information from
                    inappropriate loss, misuse, access, disclosure, alteration or destruction.
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>We use Secure Sockets Layer (SSL) technology to encrypt all data transmissions</li>
                    <li>Industry-standard security measures and regular security audits</li>
                    <li>Compliance with GDPR, CCPA, PIPEDA, and other data protection regulations</li>
                    <li>Limited access to personal data on a need-to-know basis</li>
                  </ul>
                  <p className="mt-4">
                    No method of transmission over the internet is 100% secure. We cannot guarantee absolute
                    security but we will always do our best. If we experience unauthorized access, we will
                    notify you and relevant authorities in accordance with applicable laws.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">Data Retention</h2>
                  <p className="mb-4">
                    We will only keep your data for as long as necessary for the purpose for which it was collected,
                    subject to satisfying any legal, accounting or reporting requirements.
                  </p>
                  <p className="mb-4">
                    At the end of any retention period, your data will either be deleted completely or anonymized
                    for statistical analysis and business planning.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">Marketing</h2>
                  <p className="mb-4">
                    <strong>We do not broker, rent or sell your personal information to third parties.</strong>
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">Updates to This Policy</h2>
                  <p className="mb-4">
                    Privacy laws and our practices change over time and may result in changes to our Privacy Policy.
                    We reserve the right to modify this policy at any time.
                  </p>
                  <p className="mb-4">
                    Any material changes will be notified to you via email (if we have your contact information)
                    or a popup when you access our website. Continued use of our services after changes indicates
                    acceptance of the updated policy.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">Contact Us</h2>
                  <p>
                    If you have questions about this Privacy Policy, want to request a copy of your data,
                    request deletion, or have any complaints about how we handle your personal information, contact us at{" "}
                    <a href="mailto:legal@healthintegrityproject.org" className="text-accent hover:underline">
                      legal@healthintegrityproject.org
                    </a>
                  </p>
                </section>

                <div className="border-t border-border pt-6 mt-8">
                  <p className="text-sm text-foreground/70">
                    Last updated: January 2026
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="cookies" className="mt-6">
              <div className="bg-card border border-border rounded-lg p-8 space-y-6 text-foreground">
                <section className="border-b border-border pb-6">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">TL;DR</h2>
                  <p>
                    We use <strong>only the necessary cookies for authentication</strong> purposes on our website.
                    This cookie policy governs how we use cookies and other digital technologies on our site.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">What are cookies?</h2>
                  <p className="mb-4">
                    Cookies are small plain-text key-value data pairs that websites use to make your
                    experience more enjoyable and efficient.
                  </p>
                  <p className="mb-4">
                    If you would like to find out more about cookies and similar technologies, visit{" "}
                    <a href="https://allaboutcookies.org" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                      allaboutcookies.org
                    </a>.
                  </p>
                  <p className="mb-4">Cookies on our site may be:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Automatically deleted after every visit (session cookies) or remaining in place during multiple visits (persistent cookies)</li>
                    <li>Delivered in a first-party (set by us) or third-party (set by another website) context</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">How we use cookies</h2>
                  <p className="mb-4">
                    This website uses cookies in compliance with applicable data protection laws.
                    We use cookies to provide you with essential features and services, including:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Recognizing you when you sign-in to use our services, allowing us to display personalized content</li>
                    <li>Conducting research and diagnostics to make it easier for you to use our website</li>
                    <li>Reporting to measure and analyze our performance and compliance</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">How you can manage cookies</h2>
                  <p className="mb-4">
                    <strong>A single cookie is used for authentication purposes and it is necessary.</strong> You may
                    manage cookies by adjusting the settings on your browser. However, by disabling cookies,
                    you may not be able to use the full functionality of the website.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">Cookie Categories</h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">Strictly Necessary ✓</h3>
                      <p className="text-sm">
                        These cookies are necessary for the website to function and cannot be switched off.
                        They are usually only set in response to actions made by you, such as setting your
                        privacy preferences or logging in. These cookies do not store any personally identifiable information.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">Functional ✗</h3>
                      <p className="text-sm text-muted-foreground">
                        We don't use any functional cookies. These would enable enhanced functionality and
                        personalization by third-party providers.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">Performance ✗</h3>
                      <p className="text-sm text-muted-foreground">
                        We don't use any performance cookies. These would allow us to analyze site usage
                        to measure and improve performance.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">Marketing ✗</h3>
                      <p className="text-sm text-muted-foreground">
                        We don't use any marketing cookies. These would be used by marketing tools to better
                        serve you content relevant to your interests.
                      </p>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">Do Not Sell My Info</h2>
                  <p className="mb-4">
                    In the US, you may see "Do Not Sell My Info" links on websites.{" "}
                    <strong>We don't broker or sell your personal information to third parties.</strong>
                  </p>
                  <p>
                    Go to our Privacy Policy for more information about who we are, how you can contact us,
                    and how we process personal information.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">Unknown Cookies</h2>
                  <p>
                    If you ever come across a third-party data collection tool that has not been authorized
                    (such as one that may have been mistakenly placed by another user or administrator),
                    please report it to us at{" "}
                    <a href="mailto:legal@healthintegrityproject.org" className="text-accent hover:underline">
                      legal@healthintegrityproject.org
                    </a>.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">Data Protection Laws</h2>
                  <p className="mb-4">Our cookie policy complies with:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>California Consumer Privacy Act (CCPA) in the United States</li>
                    <li>General Data Protection Regulation (GDPR) in the UK and Europe</li>
                    <li>Personal Information Protection and Electronic Documents Act (PIPEDA) in Canada</li>
                    <li>Privacy Act in Australia</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">Version Control</h2>
                  <p>
                    This policy is subject to change as laws and regulations evolve. We will periodically
                    review and update the policy to ensure it's aligned with best practices and legal requirements.
                  </p>
                </section>

                <div className="border-t border-border pt-6 mt-8">
                  <p className="text-sm text-foreground/70">
                    Last updated: January 2026
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="terms" className="mt-6">
              <div className="bg-card border border-border rounded-lg p-8 space-y-6 text-foreground">
                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">Platform Purpose</h2>
                  <p className="mb-4">
                    The Health Integrity Project is a platform dedicated to bridging the gap between scientific
                    research and public understanding of health information, with a focus on women's health and empowerment.
                    Our mission is to provide transparency, clarity, and evidence-based content that helps people
                    make informed decisions about their health.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">Age Requirement</h2>
                  <p className="mb-4">
                    <strong>You must be at least 16 years of age to use this platform.</strong> We do not knowingly
                    collect personal information from individuals under 16. If we discover that we have inadvertently
                    collected such information, we will delete it immediately.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">Account Types</h2>
                  <p className="mb-4">
                    We offer two types of accounts:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>
                      <strong>User Accounts:</strong> Regular users can sign up with minimal personal information
                      (email address) to access our platform and browse content.
                    </li>
                    <li>
                      <strong>Expert/Researcher Accounts:</strong> Experts and researchers who create and review
                      content must undergo a vetting process and provide credentials (education, experience,
                      professional information) to validate their expertise. This is fundamental to maintaining
                      the integrity of our platform.
                    </li>
                  </ul>
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
                    <li>Not engage in harassment, abuse, or misuse of the platform</li>
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
                    <li>Content provided by third-party experts or researchers</li>
                  </ul>
                  <p className="mt-4">
                    <strong>This platform is not a substitute for professional medical advice, diagnosis, or treatment.</strong>{" "}
                    Always consult qualified healthcare professionals for medical concerns.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">Content & Intellectual Property</h2>
                  <p className="mb-4">
                    All content on this platform, including research summaries, analyses, and original materials,
                    is the property of The Health Integrity Project or licensed to us by content creators.
                  </p>
                  <p className="mb-4">
                    When sharing or citing content from our platform, you must provide appropriate attribution
                    to the original research sources and our platform.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">Updates and Changes</h2>
                  <p className="mb-4">
                    We reserve the right to update these terms as our platform evolves. Users will be notified of
                    significant changes, and continued use constitutes acceptance of updated terms.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">Termination</h2>
                  <p className="mb-4">
                    We reserve the right to suspend or terminate accounts that violate these terms, engage in
                    abusive behavior, or misuse the platform. You may also request account deletion at any time
                    by contacting us.
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
                    Last updated: January 2026
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
