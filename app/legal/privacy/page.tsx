import Footer from "@/components/Footer";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <section className="px-6 pb-20 pt-14 sm:pt-32 md:pt-36">
        <div className="mx-auto w-full max-w-5xl text-center">
          <h1 className="text-4xl font-semibold sm:text-6xl">
            <span className="accent-text">Privacy</span> Policy
          </h1>
          <p className="mt-4 text-sm text-white/60 sm:text-base">
            Learn how Ducky stores, processes, and protects your data.
          </p>
          <div className="legal-meta mt-8">
            <div>
              <span className="legal-label">Terms of Service</span>
              <a href="/legal/terms" className="terms-link">
                https://duckybot.xyz/legal/terms
              </a>
            </div>
            <div>
              <span className="legal-label">Effective Date</span>
              <span className="legal-value">September 29, 2024</span>
            </div>
            <div>
              <span className="legal-label">Last Updated</span>
              <span className="legal-value">August 15, 2025</span>
            </div>
          </div>
        </div>

        <div className="legal-stack mx-auto mt-12 w-full max-w-4xl text-left text-sm text-white/70 sm:text-base">
          <section id="introduction" className="terms-section">
            <h2 className="terms-title">1. Introduction</h2>
            <p>
              Welcome to the Privacy Policy of Ducky. If you haven't already,
              read and accept our Terms of Service first and then this Privacy
              Policy. We will try to be as transparent as possible about how
              Ducky uses information it receives from users. Whenever this
              Privacy Policy mentions <strong>giving us consent</strong> or
              similar phrases, it refers to giving Ducky your consent. "Us" and
              "Ducky" are used interchangeably, and both mean the same thing in
              this context.
            </p>
          </section>

          <section id="website" className="terms-section">
            <h2 className="terms-title">2. Using the Ducky website</h2>
            <p>
              We currently support 2 features on our website that collect and
              process information. This includes Discord login and Roblox login;
              these are both done through an OAuth2 flow. For Discord login, the
              website stores a cookie with the provided authentication code from
              Discord. For Roblox login, the authentication code from Roblox is
              send to our API, which can link your Discord account with your
              Roblox account. More information about linking with Ducky can be
              found in section 3.1. Our domain is managed by Cloudflare, which
              provides basic statistical information about traffic on our
              domain. For information about how Cloudflare handles data, please
              view their privacy policy (accessible at{" "}
              <a
                href="https://www.cloudflare.com/privacypolicy/"
                target="_blank"
                rel="noreferrer"
                className="terms-link"
              >
                https://www.cloudflare.com/privacypolicy
              </a>
              ).
            </p>
          </section>

          <section id="discord" className="terms-section">
            <h2 className="terms-title">3. Using Ducky in Discord</h2>
            <p>
              When using Ducky in your Discord server, you give us consent to
              see and process information about your server and you Ducky has
              access to. Additionally, Ducky may store and use information you
              give it to make it do what it's supposed to. Extra information on
              specific topics can be found below.
            </p>

            <h3 className="terms-subtitle">3.1. Roblox Linking</h3>
            <p>
              There are 2 ways you can get linked with Ducky. First is manually
              linking yourself. This can be done through the website or with
              the legacy verification method through a Discord command. The
              second possibility is when joining a server that has the{" "}
              <strong>Use Bloxlink</strong> feature enabled. This will use the
              Bloxlink "private" API (which requires a server key and the user
              to be a member of the server) to see if you have Roblox
              information on Bloxlink. If it does find Roblox information, it
              will DM you with confirmation and will not store the information
              from the Bloxlink API until you authorize this. If you don't want
              to receive this DM anymore, you can click the third option{" "}
              <strong>Deny, and don't ask again</strong>. Ducky will store your
              preference in usersettings, which can be managed with the{" "}
              <strong>/usersettings</strong> command. With that command you can
              also disable this feature in advance, and Ducky will not look up
              Roblox information using the Bloxlink API for you. Once linked
              with Ducky, using any way, anyone can get your Roblox ID using
              your Discord ID and the other way around. You can unlink from
              Ducky at any time using the <strong>/link</strong> command and
              clicking <strong>Unlink</strong>.
            </p>

            <h3 className="terms-subtitle">3.2. ERLC API Key</h3>
            <p>
              When providing Ducky with an API key, you give us consent to see
              and process information about your ERLC server. Ducky will
              automate requests to the PRC API, required for many of its
              features. Abiding by the PRC Private Server API Use Guidelines
              (accessible at{" "}
              <a
                href="https://apidocs.policeroleplay.community/api-information/api-use-guidelines"
                target="_blank"
                rel="noreferrer"
                className="terms-link"
              >
                https://apidocs.policeroleplay.community/api-information/api-use-guidelines
              </a>
              ), once Ducky is removed from your server, it will not make any
              requests to the PRC API using your API key. For information about
              data retention, including the retention of your ERLC API key, see
              section 6.
            </p>
          </section>

          <section id="storage" className="terms-section">
            <h2 className="terms-title">4. Storage of Data</h2>
            <p>
              Ducky stores data in an SQL database stored on the VPS (Virtual
              Private Server) managed by Vertuo Hosting (
              <a
                href="https://vertuohosting.com"
                target="_blank"
                rel="noreferrer"
                className="terms-link"
              >
                https://vertuohosting.com
              </a>
              ). The raw data files are only accessible by Ducky Senior
              Developers+, which currently include @bobbibones (Discord ID:
              782235114858872854) and @troptopreal (Discord ID:
              598958193032560642). Access to data through any Ducky service will
              ensure the user has the required authorization to access that
              data. Ducky frequently makes a backup of the raw data file.
              Backups are deleted after 5 days, and are only used for disaster
              recovery. We do not sell your data. We may share it with trusted
              third parties only when necessary to provide our services, comply
              with legal obligations, or protect our rights.
            </p>
          </section>

          <section id="security" className="terms-section">
            <h2 className="terms-title">5. Security of Data</h2>
            <p>
              We take reasonable technical and organizational measures to
              protect your data. However, no system is completely secure, and
              we cannot guarantee prevention of unauthorized access, loss, or
              breaches. To the fullest extent permitted by law, we disclaim
              liability for any resulting damages.
            </p>
          </section>

          <section id="retention" className="terms-section">
            <h2 className="terms-title">6. Retention and Deletion of Data</h2>
            <p>
              Server data is removed 7 days after removing Ducky from the
              server. You can manually wipe all server data on the first page of{" "}
              <strong>/setup</strong>. As stated in section 4, we make backups
              of the raw data file; this includes all data. Backups are deleted
              after 5 days.
            </p>
          </section>

          <section id="requests" className="terms-section">
            <h2 className="terms-title">7. Data Requests</h2>
            <p>
              If you would like to request all data we have about you or
              request deletion of all data, you can create a development ticket
              in our support server (Discord ID: 1228508072289370172, accessible
              at{" "}
              <a
                href="https://discord.gg/w2dNr7vuKP"
                target="_blank"
                rel="noreferrer"
                className="terms-link"
              >
                https://discord.gg/w2dNr7vuKP
              </a>
              ) or DM bobbibones (Discord ID: 782235114858872854). We do not
              allow this through any other communication channel, as we cannot
              confirm ownership on any other communication channel.
            </p>
          </section>

          <section id="updates" className="terms-section">
            <h2 className="terms-title">8. Modifications to this Privacy Policy</h2>
            <p>
              By continuing to use our service after changes have been posted,
              you are agreeing to those changes. To receive notifications about
              updates to our Privacy Policy, updates will be posted in a
              dedicated thread under the shouts channel (Channel ID:
              1258891659874144256, Thread ID: 1394306899653955614). You can join
              the support server (Discord ID: 1228508072289370172, accessible at{" "}
              <a
                href="https://discord.gg/w2dNr7vuKP"
                target="_blank"
                rel="noreferrer"
                className="terms-link"
              >
                https://discord.gg/w2dNr7vuKP
              </a>
              ). When joining, you can select the "Legal" role to receive pings
              about updates posted in this thread for the Privacy Policy and our
              Terms of Service (accessible at{" "}
              <a href="/legal/terms" className="terms-link">
                https://duckybot.xyz/legal/terms
              </a>
              ). If you are already in the support server, you can obtain the
              "Legal" role via the "Channels & Roles" tab at the top of the
              channel list.
            </p>
            <p>
              By doing any of the following, you agree <strong>not</strong> to
              be notified about changes to this Privacy Policy:
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
        </div>
      </section>

      <Footer />
    </div>
  );
}
