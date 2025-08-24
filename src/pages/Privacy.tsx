import Header from "@/components/layout/Header";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header />
      <main className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8">Privacy Policy</h1>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 space-y-6 text-white/90">
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Data Collection</h2>
              <p className="mb-4">
                We collect minimal personal information necessary to provide our research platform services. This includes:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Email address for account creation and communication</li>
                <li>Usage analytics to improve our research tools</li>
                <li>Research preferences and saved affirmations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">How We Use Your Data</h2>
              <p className="mb-4">Your information is used to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide personalized research-backed affirmations</li>
                <li>Improve our platform's educational content</li>
                <li>Send important updates about new research findings</li>
                <li>Maintain platform security and prevent abuse</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Data Protection</h2>
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
              <h2 className="text-2xl font-semibold text-white mb-4">Your Rights</h2>
              <p className="mb-4">You have the right to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Access your personal data</li>
                <li>Request data correction or deletion</li>
                <li>Opt out of non-essential communications</li>
                <li>Download your data in a portable format</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Research Ethics</h2>
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
              <h2 className="text-2xl font-semibold text-white mb-4">Contact Us</h2>
              <p>
                If you have questions about this Privacy Policy or your data, please contact us at{" "}
                <a href="mailto:privacy@healthkorpus.com" className="text-accent hover:underline">
                  privacy@healthkorpus.com
                </a>
              </p>
            </section>

            <div className="border-t border-white/20 pt-6 mt-8">
              <p className="text-sm text-white/70">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Privacy;