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
                {/* TL;DR */}
                <section className="border-b border-border pb-6">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">TL;DR</h2>
                  <div className="space-y-3">
                    <p>
                      You may know us as "The Health Integrity Project". In this policy, we may be referred to as "we", "our", or "us".
                    </p>
                    <p>
                      We started this project because we care about data and science integrity, transparency, and making that information available for people. We value data privacy as much as this project and consider protecting your data an absolute must.
                    </p>
                    <p>
                      <strong>You do not have to provide personal information like your real name, address, or date of birth</strong> to sign up for a regular user account. For experts and researchers who create content, we require personal information to validate credentials—this is fundamental to keeping this project integral.
                    </p>
                    <p>
                      <strong>We do not sell or rent your information to anybody.</strong> We keep the amount of data we collect and the number of third parties involved to the minimum necessary to run this site and make it better for you.
                    </p>
                  </div>
                </section>

                {/* 1. About this Privacy Notice */}
                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">1. About this Privacy Notice</h2>
                  <p className="mb-4">
                    This Privacy Policy applies to the personal information we collect about you through our website or when you communicate with us. You have rights in relation to how we use your personal information.
                  </p>
                  <p>
                    By using our website, <strong>you represent that you are at least 16 years of age.</strong> We do not knowingly advertise to, or collect personal information from, any individual under the age of 16. If we become aware that we have collected personal information from someone under 16, we will suspend any services and delete that personal information immediately.
                  </p>
                </section>

                {/* 2. Definitions */}
                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">2. Definitions, Data & Metadata</h2>
                  <div className="overflow-x-auto mb-6">
                    <table className="w-full text-sm border border-border rounded-lg">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="px-4 py-3 text-left font-semibold">Term</th>
                          <th className="px-4 py-3 text-left font-semibold">Meaning</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        <tr>
                          <td className="px-4 py-3 align-top">The Health Integrity Project, us, we, our, the project, HIP</td>
                          <td className="px-4 py-3">The Health Integrity Project team that operates the site</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 align-top">Our services, the website</td>
                          <td className="px-4 py-3">The Health Integrity Project websites, emails, and notifications; excluding third-party sites and services that have their own privacy policies</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 align-top">Personal Information</td>
                          <td className="px-4 py-3">Information you provide or we collect that relates to you or could identify you: real name, email address, password, IP address, user-agent information, picture, location, website, social media identifiers, education and professional information</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 align-top">Contributions</td>
                          <td className="px-4 py-3">Content you add or changes you make to any HIP Sites</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 align-top">User account</td>
                          <td className="px-4 py-3">An account you can sign up for and use to browse the HIP Sites</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 align-top">Expert or Researcher account</td>
                          <td className="px-4 py-3">An account you are invited to by the HIP team, requiring a vetting process</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 align-top">Third parties</td>
                          <td className="px-4 py-3">Individuals, entities, websites, services, products, and applications not controlled by HIP, including other users and independent organizations</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <h3 className="text-xl font-semibold text-foreground mb-3">About Metadata</h3>
                  <p className="mb-4">
                    Metadata collection helps improve your user experience, but you may remove or disable some or all locally stored data through your browser settings.
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>Cookies:</strong> We use cookies to understand how you use the HIP Sites, make our services safer and easier to use, and create a better experience. See our Cookie Policy for more information.</li>
                    <li><strong>IP Addresses:</strong> When you visit our website, we automatically receive your device's IP address, which could determine your geographical location.</li>
                    <li><strong>Browser Data:</strong> We receive information including device type, unique device IDs, browser type and version, language preference, operating system, internet service provider, referring website, pages visited, and timestamps.</li>
                    <li><strong>Local Storage:</strong> We use technologies like local storage and session storage to deliver our services. This may include text, Personal Information (like your IP address), and usage information (like your username or visit time).</li>
                  </ul>
                </section>

                {/* 3. Personal Information We Collect */}
                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">3. Personal Information We Collect, How & Why</h2>

                  <h3 className="text-xl font-semibold text-foreground mb-3">Data Controller</h3>
                  <p className="mb-4">
                    For the purposes of the General Data Protection Regulation (GDPR), "The Health Integrity Project" is a "Data Controller".
                  </p>

                  <h3 className="text-xl font-semibold text-foreground mb-3">Information We Collect</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                    <li>Account login and contact details such as your name and email address</li>
                    <li>For experts: picture, expertise area, years of experience, location, personal website/company name, education credentials</li>
                    <li>Website and social media details such as profile names you choose to share</li>
                    <li>Images, photos, and user-generated content</li>
                    <li>Device information such as IP address, device ID and type, location, activity logs, browser type, language, time zone</li>
                  </ul>

                  <h3 className="text-xl font-semibold text-foreground mb-3">How We Collect It</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                    <li>When you access and use our website via technologies described in the Metadata section</li>
                    <li>When you create an account</li>
                    <li>When you contact us with an inquiry or complaint</li>
                    <li>When you engage with us on social media</li>
                    <li>When you apply for membership as an expert/researcher</li>
                    <li>When you respond to a survey</li>
                  </ul>

                  <h3 className="text-xl font-semibold text-foreground mb-3">Why We Collect It</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>To provide you with our services</li>
                    <li>To update you with new content on our website and via email (with your consent)</li>
                    <li>To engage with you on social media</li>
                    <li>To review applications for expert/researcher recruitment</li>
                    <li>To improve and optimize our website</li>
                    <li>To collect survey feedback to improve content</li>
                    <li>For accounting, audit, legal, and internal purposes</li>
                  </ul>
                </section>

                {/* 4. Marketing */}
                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">4. Marketing</h2>
                  <p>
                    <strong>We do not broker, rent, or sell your personal information to third parties.</strong>
                  </p>
                </section>

                {/* 5. Disclosure To Third Parties */}
                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">5. Disclosure To Third Parties & Cross-Borders</h2>
                  <p className="mb-4">
                    We share the minimum amount of your personal information to pursue our legitimate interests in a way that does not materially impact your rights, freedom, or interests.
                  </p>
                  <p className="mb-4">These third parties include:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                    <li>Service providers who perform functions on our behalf (e.g., cloud storage providers)</li>
                    <li>Government regulatory bodies and law enforcement agencies as required by law</li>
                    <li>Anyone else to whom you authorize us to disclose it</li>
                  </ul>
                  <p className="mb-4">
                    Should we transfer your personal data outside of the United States, we will ensure that a similar degree of protection is afforded by ensuring those countries provide an adequate level of protection for personal information.
                  </p>

                  <h3 className="text-xl font-semibold text-foreground mb-3">Our Third-Party Providers</h3>
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
                        <tr>
                          <td className="px-4 py-3">Buttondown</td>
                          <td className="px-4 py-3">Newsletter services</td>
                          <td className="px-4 py-3">
                            <a href="https://buttondown.com/legal/privacy" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                              View Policy
                            </a>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground">
                    Once you leave our website or are redirected to a third-party website or application, you are no longer governed by this Privacy Policy or our Terms of Service.
                  </p>
                </section>

                {/* 6. Your Rights */}
                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">6. Your Rights</h2>

                  <h3 className="text-xl font-semibold text-foreground mb-3">Disclosure of Your Personal Information</h3>
                  <p className="mb-4">
                    You may request that we disclose the personal information we hold about you, including a copy and details of our processing activities (what we collect, how we use it, and any third parties with whom we share it). You may also request your information in a portable format (structured, commonly used, machine-readable) to transmit to another entity.
                  </p>
                  <p className="mb-4">
                    We may limit or reject requests where the burden would be disproportionate, where other persons' rights would be violated, or as required by law.
                  </p>

                  <h3 className="text-xl font-semibold text-foreground mb-3">Modification of Personal Information</h3>
                  <p className="mb-4">
                    Please notify us if your personal information is inaccurate or incomplete. You may request to update or correct your information via the link on our website footer.
                  </p>

                  <h3 className="text-xl font-semibold text-foreground mb-3">Objection & Restriction</h3>
                  <p className="mb-4">
                    You may object to your personal information being processed in certain circumstances, or where we do not have a lawful basis. You may restrict processing where you are contesting accuracy, where we lack lawful basis, to oppose erasure, or if you are exploring your right to object.
                  </p>

                  <h3 className="text-xl font-semibold text-foreground mb-3">Right to Deletion ("Forget Me")</h3>
                  <p className="mb-4">
                    You may request that we delete your personal information. If you make a request, we will delete your personal information.
                  </p>

                  <h3 className="text-xl font-semibold text-foreground mb-3">Withdrawing Consent & Opting Out</h3>
                  <p className="mb-4">
                    You may withdraw your consent at any time. If you do, we will only communicate with you where necessary to complete our obligations.
                  </p>

                  <h3 className="text-xl font-semibold text-foreground mb-3">When You Exercise Your Rights</h3>
                  <p className="mb-4">
                    We will continue to provide you with the same service as all our users. However, where you do not supply certain information or request its deletion, we may be delayed or prevented from satisfying your request.
                  </p>

                  <h3 className="text-xl font-semibold text-foreground mb-3">Complaints</h3>
                  <p className="mb-4">
                    If you have a complaint about how we handle your personal information, please contact us via the link on our website footer.
                  </p>

                  <h3 className="text-xl font-semibold text-foreground mb-3">Verifying Your Identity</h3>
                  <p>
                    We take privacy seriously. If you contact us to make an enquiry or exercise your rights, we may ask additional questions to verify your identity.
                  </p>
                </section>

                {/* 7. Security */}
                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">7. Security</h2>
                  <p className="mb-4">
                    We take all reasonable security measures to ensure your personal information is not inappropriately lost, misused, accessed, disclosed, altered, or destroyed.
                  </p>
                  <p className="mb-4">
                    We use Secure Sockets Layer (SSL) technology to protect your online information. SSL encrypts all information including personal data, providing security by encrypting all data transmissions.
                  </p>
                  <p className="mb-4">
                    No method of transmission over the internet using industry standard technology is 100% secure. Therefore, we cannot guarantee the absolute security of your personal information, but we will always try our best.
                  </p>
                  <p className="mb-4">
                    If we ever experience unauthorized access, disclosure, or use of your personal information, we will follow our processes to notify you and the relevant government body in accordance with relevant laws.
                  </p>

                  <h3 className="text-xl font-semibold text-foreground mb-3">Retention</h3>
                  <p className="mb-4">
                    We will only keep your data for as long as necessary for the purpose for which it was collected, subject to legal, accounting, or reporting requirements.
                  </p>
                  <p className="mb-4">
                    At the end of any retention period, your data will either be deleted completely or anonymized (for example, by aggregation with other data so it can be used for statistical analysis and business planning in a non-identifiable way).
                  </p>
                  <p>
                    Non-Personal Information may be retained indefinitely as appropriate.
                  </p>
                </section>

                {/* 8. Sharing Information Online */}
                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">8. Sharing Information Online & Links To Other Websites</h2>
                  <p className="mb-4">
                    We may make available opportunities for you to share information online like social media or blogs. Please be aware that whenever you voluntarily disclose personal information online, that information becomes public and can be collected and used by others. We have no control over, and take no responsibility for, the use, storage, or dissemination of publicly disclosed personal information.
                  </p>
                  <p>
                    Sometimes our website may contain links to third-party websites. We are not responsible for the content or privacy practices of third-party websites. We suggest you review the privacy policy of each website you visit.
                  </p>
                </section>

                {/* 9. Updating Our Privacy Policy */}
                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">9. Updating Our Privacy Policy</h2>
                  <p className="mb-4">
                    Privacy laws and our practices change over time and may result in changes to our Privacy Policy. We reserve the right to modify this Privacy Policy at any time.
                  </p>
                  <p className="mb-4">
                    Any changes will be effective upon publication on our website and will replace any other privacy policy published by us to date. Your continued use of our services after publication of any modified privacy policy indicates your acceptance of the updated Privacy Policy.
                  </p>
                  <p>
                    Any material changes will be notified to you in a manner we consider appropriate, such as via email (if we have your contact information) or a popup when you access our website.
                  </p>
                </section>

                {/* 10. Contact Us */}
                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">10. How To Contact Us</h2>
                  <p>
                    If you have any enquiries about your account, questions or complaints about how we handle your personal information, or you want to request a copy or deletion of your data, you can contact our Privacy Officer via email at{" "}
                    <a href="mailto:legal@healthintegrityproject.org" className="text-accent hover:underline">
                      legal@healthintegrityproject.org
                    </a>
                  </p>
                </section>

                <div className="border-t border-border pt-6 mt-8">
                  <p className="text-sm text-muted-foreground">
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
