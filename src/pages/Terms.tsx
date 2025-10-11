import Header from "@/components/layout/Header";

const Terms = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header />
      <main className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8">Terms of Service & Data Usage</h1>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 space-y-6 text-white/90">
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Platform Purpose</h2>
              <p className="mb-4">
                ClaimWell is an educational platform that provides research-backed affirmations 
                and insights specifically focused on women's experiences, health, and empowerment. Our mission is to 
                bridge the gap between scientific research and practical self-empowerment tools.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Research Standards</h2>
              <p className="mb-4">All research featured on our platform adheres to strict quality standards:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Peer Review:</strong> Only peer-reviewed studies from reputable journals</li>
                <li><strong>Sample Size Transparency:</strong> Clear indication of study sample sizes and limitations</li>
                <li><strong>Population Representation:</strong> Diversity metrics and demographic information</li>
                <li><strong>Research Consensus:</strong> Multiple studies supporting each affirmation when available</li>
                <li><strong>Evidence Quality:</strong> Strength of evidence clearly communicated</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Data Usage Terms</h2>
              <p className="mb-4">By using our platform, you agree that:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Research data is for educational and personal empowerment purposes only</li>
                <li>Information should not replace professional medical or psychological advice</li>
                <li>You will not misrepresent or misuse the research findings</li>
                <li>Attribution to original research sources is required for any sharing</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">User Responsibilities</h2>
              <p className="mb-4">Users are expected to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Use the platform respectfully and in accordance with its educational purpose</li>
                <li>Understand that research findings are generalizations and may not apply to every individual</li>
                <li>Consult healthcare professionals for medical concerns</li>
                <li>Report any technical issues or content concerns promptly</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Limitation of Liability</h2>
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
              <h2 className="text-2xl font-semibold text-white mb-4">Research Methodology Transparency</h2>
              <p className="mb-4">
                We believe in complete transparency about research quality. Each study includes:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Sample Size Scoring:</strong> Clear indicators of study participant numbers</li>
                <li><strong>Representation Metrics:</strong> Information about demographic diversity</li>
                <li><strong>Consensus Indicators:</strong> How many studies support each finding</li>
                <li><strong>Evidence Strength:</strong> Quality assessment of the research methodology</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Updates and Changes</h2>
              <p className="mb-4">
                We reserve the right to update these terms as our platform evolves. Users will be notified of 
                significant changes, and continued use constitutes acceptance of updated terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Contact</h2>
              <p>
                For questions about these terms or our data usage policies, contact us at{" "}
                <a href="mailto:terms@claimwell.com" className="text-accent hover:underline">
                  terms@claimwell.com
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

export default Terms;