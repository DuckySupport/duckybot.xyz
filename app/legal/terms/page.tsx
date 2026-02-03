import Footer from "@/components/Footer";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <section className="px-6 pb-20 pt-28 sm:pt-32 md:pt-36">
        <div className="mx-auto w-full max-w-5xl text-center">
          <h1 className="text-4xl font-semibold sm:text-6xl">
            Terms of <span className="accent-text">Service</span>
          </h1>
          <p className="mt-4 text-sm text-white/60 sm:text-base">
            Learn how to use Ducky while respecting our guidelines.
          </p>
          <div className="legal-meta mt-8">
            <div>
              <span className="legal-label">Privacy Policy</span>
              <a href="/legal/privacy" className="terms-link">
                https://duckybot.xyz/legal/privacy
              </a>
            </div>
            <div>
              <span className="legal-label">Effective Date</span>
              <span className="legal-value">September 29, 2024</span>
            </div>
            <div>
              <span className="legal-label">Last Updated</span>
              <span className="legal-value">December 17, 2025</span>
            </div>
          </div>
        </div>

        <div className="legal-stack mx-auto mt-12 w-full max-w-4xl text-left text-sm text-white/70 sm:text-base">
          <section id="agreement" className="terms-section">
            <h2 className="terms-title">1. Agreement</h2>
            <p>
              This Terms of Service Agreement ("Agreement") is between the
              Ducky Developers ("Ducky Team") and you ("User"). The Service
              ("Service", "Bot", "Ducky") includes the Ducky Discord bot (ID:
              1257389588910182411) and its website (
              <a
                href="https://duckybot.xyz"
                target="_blank"
                rel="noreferrer"
                className="terms-link"
              >
                https://duckybot.xyz
              </a>
              ). By using the Service, you agree to these terms. If you don't
              agree, stop using the Service immediately. The support server
              ("Support Server", "Ducky's Pond") is accessible at{" "}
              <a
                href="https://discord.gg/w2dNr7vuKP"
                target="_blank"
                rel="noreferrer"
                className="terms-link"
              >
                https://discord.gg/w2dNr7vuKP
              </a>{" "}
              (ID: 1228508072289370172).
            </p>
            <p>
              For questions or inquiries, contact us using the information in
              section 9.
            </p>
          </section>

          <section id="about" className="terms-section">
            <h2 className="terms-title">2. About Ducky</h2>
            <p>
              Ducky is a bot developed for the chat and social platform Discord
              (accessible at{" "}
              <a
                href="https://discord.com"
                target="_blank"
                rel="noreferrer"
                className="terms-link"
              >
                https://discord.com
              </a>
              ), provided by Discord Inc. Utilizing Discord's public API, built
              with Lua and the Discordia Library (details available at{" "}
              <a
                href="https://discord.dev"
                target="_blank"
                rel="noreferrer"
                className="terms-link"
              >
                https://discord.dev
              </a>
              ), Ducky aims to enhance User experience with various tools and
              interactions in compliance with Discord's terms and guidelines.
              Ducky strictly adheres to Discord's Developer Terms and maintains
              responsible and respectful use of Discord's services.
            </p>
            <p>
              Users are required to use Ducky in ways that align with both
              Ducky's terms and Discord's policies. Unauthorized use, such as
              sending unsolicited messages, spamming channels or direct
              messages, or engaging in any activity that violates Ducky's or
              Discord's terms, is strictly prohibited. If you encounter or
              suspect any misuse of Ducky, please report it to the developers
              immediately through our support server.
            </p>
          </section>

          <section id="usage" className="terms-section">
            <h2 className="terms-title">3. Usage Restrictions</h2>
            <p>
              Ducky includes features that allow users to send anonymous
              messages to channels. Server owners are responsible for ensuring
              these messages comply with our restrictions. For messages sent via
              DM that include a <strong>"Sent from"</strong> indicator, the
              owner of the specified Discord server is responsible for ensuring
              compliance with our restrictions.
            </p>
            <p>You may not do the following while using Ducky:</p>
            <ul className="terms-list">
              <li>
                Use Ducky in servers that violate{" "}
                <a
                  href="https://discord.com/guidelines/"
                  target="_blank"
                  rel="noreferrer"
                  className="terms-link"
                >
                  Discord's Community Guidelines
                </a>{" "}
                or{" "}
                <a
                  href="https://discord.com/channels/505904189613015050/736688656139419689"
                  target="_blank"
                  rel="noreferrer"
                  className="terms-link"
                >
                  PRC's Community Guidelines
                </a>
                .
              </li>
              <li>Send a high volume of messages in a short amount of time.</li>
              <li>Send any kind of advertisement using Ducky.</li>
              <li>Try to exploit Ducky in any way.</li>
              <li>
                Impersonate Ducky or the whole Ducky Team (including Quality
                Assurance, Moderators, Support, Administrators, Management, Web
                Developers, and Developers).
              </li>
            </ul>
          </section>

          <section id="privacy" className="terms-section">
            <h2 className="terms-title">4. Privacy Policy</h2>
            <p>
              Ducky's Privacy Policy (accessible at{" "}
              <a href="/legal/privacy" className="terms-link">
                https://duckybot.xyz/legal/privacy
              </a>
              ) applies to all interactions with the Service. The User agrees
              to the collection and use of information as outlined in the
              Privacy Policy.
            </p>
          </section>

          <section id="duckyplus" className="terms-section">
            <h2 className="terms-title">5. Ducky Plus+ Subscription</h2>
            <p>
              Ducky Plus+ slots are purchased through the{" "}
              <strong>/plus manage</strong> command and can apply Ducky Plus+ to
              one server until refunded. Once applied, slots are bound to the
              server until refunded. Slots can be gifted to others. SELLING OR
              TRADING DUCKY PLUS+ SLOTS IS STRICTLY PROHIBITED. PURCHASING A
              DUCKY PLUS+ SLOT IN ANY WAY THAT DOES NOT GRANT US THE FULL
              PAYMENT AFTER DEFAULT ROBLOX TAX (30%) WILL NOT GRANT YOU THE
              SLOT. All purchases are final and non-refundable. Refunding a
              slot means removing it from a server and returning it to the user
              who applied it. When refunded, all Ducky Plus+ features and
              configurations that exceeded standard limits will be disabled,
              and the slot can then be applied to another server or gifted. We
              may revoke access upon violations of our Terms of Service, and
              terminations can be appealed through our Support Server.
            </p>
          </section>

          <section id="termination" className="terms-section">
            <h2 className="terms-title">6. Service Termination</h2>
            <p>
              The Ducky Team reserves the right, at any time and without notice,
              to:
            </p>
            <ul className="terms-list">
              <li>Modify the Service including but not limited to removing a feature.</li>
              <li>Discontinue the Service.</li>
              <li>Block the User from accessing the Service.</li>
            </ul>
          </section>

          <section id="legal" className="terms-section">
            <h2 className="terms-title">7. Legal Information</h2>
            <h3 className="terms-subtitle">7.1. Intellectual Property</h3>
            <p>
              The Service and all its assets are the property of the Ducky Team.
              You may not copy, modify, or distribute Ducky's code or features
              without written consent from the team.
            </p>

            <h3 className="terms-subtitle">7.2. Liability &amp; Indemnification</h3>
            <p>
              Ducky is provided "as is." The User agrees to hold the Ducky Team
              harmless from any claims, damages, or liabilities arising from the
              use of the Service.
            </p>

            <h3 className="terms-subtitle">7.3. Governing Law</h3>
            <p>
              These Terms shall be governed by the laws of the United States.
              Any legal disputes related to Ducky shall be subject to the
              exclusive jurisdiction of courts within the United States.
            </p>
          </section>

          <section id="updates" className="terms-section">
            <h2 className="terms-title">8. Modifications to these Terms</h2>
            <p>
              By continuing to use our service after changes have been posted,
              you are agreeing to those changes. To receive notifications about
              updates to these Terms of Service, updates will be posted in a
              dedicated thread under the shouts channel (Channel ID:
              1258891659874144256, Thread ID: 1394306899653955614) in the
              support server (Discord ID: 1228508072289370172, accessible at{" "}
              <a
                href="https://discord.gg/w2dNr7vuKP"
                target="_blank"
                rel="noreferrer"
                className="terms-link"
              >
                https://discord.gg/w2dNr7vuKP
              </a>
              ). Select the "Legal" role when joining to be pinged when updates
              are posted in this thread. If you are already in the support
              server, you can obtain the "Legal" role via the "Channels & Roles"
              tab at the top of the channel list.
            </p>
            <p>
              By doing any of the following, you agree <strong>not</strong> to
              be notified about changes to these Terms:
            </p>
            <ul className="terms-list">
              <li>
                Not joining the support server (Discord ID: 1228508072289370172,
                accessible at{" "}
                <a
                  href="https://discord.gg/w2dNr7vuKP"
                  target="_blank"
                  rel="noreferrer"
                  className="terms-link"
                >
                  https://discord.gg/w2dNr7vuKP
                </a>
                )
              </li>
              <li>Not selecting the "Legal" ping during onboarding</li>
              <li>
                Violating the support server rules (see the "rules" channel,
                Discord ID: 1259259527094734858)
              </li>
              <li>Disabling notifications for the support server in any way</li>
            </ul>
          </section>

          <section id="contact" className="terms-section">
            <h2 className="terms-title">9. Contact Information</h2>
            <p>
              You can contact the Ducky Team through the support server at{" "}
              <a
                href="https://discord.gg/w2dNr7vuKP"
                target="_blank"
                rel="noreferrer"
                className="terms-link"
              >
                https://discord.gg/w2dNr7vuKP
              </a>{" "}
              or via mail at{" "}
              <a href="mailto:devs@duckybot.xyz" className="terms-link">
                devs@duckybot.xyz
              </a>
              .
            </p>
          </section>
        </div>
      </section>

      <Footer />
    </div>
  );
}
