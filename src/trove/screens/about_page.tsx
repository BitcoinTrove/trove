import { Screen } from "../../platform/components/screen";
import * as React from "jsx-dom"; // Fake React for JSX->DOM support

declare var localize: (enText: string) => string;

export class AboutPage extends Screen {
  constructor(home: Screen) {
    super("About", localize("About Trove"));
    this.setContent(
      <div class="screen">
        <div style="max-width: 700px; margin: 30px auto;">
          <div>
            <span style="font-size: 32px;">{localize("About Trove")}</span>
            <button
              style="float: right;"
              class="button"
              onClick={(e) => {
                home.show();
              }}
            >
              {localize("Back home")}
            </button>
          </div>

          <div class="topic">
            <div class="topicHeading">
              <span>{localize("Bitcoin transactions")}</span>
            </div>
            <div class="topicContent">
              <p>
                {localize(
                  'The ownership of bitcoin is tracked in a ledger which contains every transaction ever made (the bitcoin blockchain). Transactions are authorized using a "private key", essentially a very large number. Each private key has a corresponding public address. If bitcoin is sent to a public address, it can only be sent again using the corresponding private key. The address can be derived from the private key, but the private key cannot be derived from the address.'
                )}
              </p>
            </div>
          </div>

          <div class="topic">
            <div class="topicHeading">
              <span>{localize("Not your keys, not your coins")}</span>
            </div>
            <div class="topicContent">
              <p>
                {localize(
                  "One of the fundamental properties of Bitcoin is the ability to hold and transfer value without the need of trusted third parties. If you do not manage your own private keys, you are giving up this freedom. There are many examples of bitcoin being lost or stolen, because users were trusting a third party."
                )}
              </p>
            </div>
          </div>

          <div class="topic">
            <div class="topicHeading">
              <span>{localize("Data loss vs data leak")}</span>
            </div>
            <div class="topicContent">
              <p
                innerHTML={localize(
                  "Managing your private key can be tricky. There is a trade-off between <strong>data loss</strong> and <strong>data leak</strong>."
                )}
              ></p>
              <br></br>
              <p
                innerHTML={localize(
                  "<strong>Data loss</strong> - If you lose your private key, you lose access to your bitcoin. Losing access is effectively the same as losing the bitcoin, because there is no other way to move them.<br>(Examples of data loss: Fire, water damage, hardware failure, etc.)"
                )}
              ></p>
              <br></br>
              <p
                innerHTML={localize(
                  "<strong>Data leak</strong> - If someone else gains access to your private key, they can steal your bitcoin by moving them to an address which only they have the private key for.<br>(Examples of data leak: Physical theft, malware, hack etc.)"
                )}
              ></p>
              <br></br>
              <h1>
                <strong>{localize("Example trade-offs")}</strong>
              </h1>
              <ul style="list-style: square; margin: 5px 20px;">
                <li>
                  {localize(
                    "Making duplicates of your private key increases your resilience to data loss, but increases your risk of data leak. There are now more copies of your private key, which someone malicious might find."
                  )}
                </li>
                <li>
                  {localize(
                    "Encrypting your private key with a password increases your resilience to data leak, but increases your risk of data loss. You might forget the password and lose access to the bitcoin."
                  )}
                </li>
              </ul>
            </div>
          </div>

          <div class="topic">
            <div class="topicHeading">
              <span>{localize("Shamir's secret sharing")}</span>
            </div>
            <div class="topicContent">
              <p
                innerHTML={localize(
                  "Shamir's secret sharing (SSS) in a cryptographic algorithm that splits a <strong>secret</strong> into multiple parts called <strong>shares</strong>. For example a secret can be split into 3 shares. The original secret can be recovered using a configurable number of these shares. For example any 2 of the 3 shares.<br><br>An important property of SSS is that having less than the required number of shares, does not reveal any information about the original secret."
                )}
              ></p>
              <br></br>
              <p>
                {localize(
                  "Splitting a bitcoin private key using SSS provides an interesting balance between data loss and data leak."
                )}
              </p>
              <br></br>
              <h1>
                <strong>{localize("In a 2 of 3 scenario:")}</strong>
              </h1>
              <ul style="list-style: square; margin: 5px 20px;">
                <li
                  innerHTML={localize(
                    "If one of the shares is <strong>lost</strong> - the private key can be recovered using the other 2 shares."
                  )}
                ></li>
                <li
                  innerHTML={localize(
                    "If one of the shares is <strong>leaked</strong> - the person who gains access to the share cannot access the private key, because they need 2 of the 3 shares."
                  )}
                ></li>
              </ul>
              <br></br>
              <p>
                {localize(
                  "If the 3 shares are entrusted to 3 different custodians. Any 2 of those custodians can collude to steal the bitcoin. The requirement of this trust in the custodians should be carefully considered."
                )}
                <br></br>
                {localize(
                  "An advantage of this sort of collusion mechanism, is for inheritance planning. If you are physically or mentally unable to access your bitcoin, a subset of the custodians can do so on your behalf."
                )}
              </p>
            </div>
          </div>

          <div class="topic">
            <div class="topicHeading">
              <span>{localize("How Trove stores bitcoin keys")}</span>
            </div>
            <div class="topicContent">
              <p>
                {localize(
                  "Trove will create a new private key which will be split and stored as secret shares. The data for each share will be stored redundantly in two formats."
                )}
                <ul style="list-style: square; margin: 5px 20px;">
                  <li
                    innerHTML={localize(
                      "<strong>Digital share</strong> - An html file which contains the encryption data, user interface and code for revealing the private key"
                    )}
                  ></li>
                  <li
                    innerHTML={localize(
                      "<strong>Paper share</strong> - A piece of paper with the encryption data encoded as a list of words that you will write down."
                    )}
                  ></li>
                </ul>
                {localize(
                  "The digital share provides ease of use in recovering the private key as well as moving the bitcoin if necessary. The paper share serves as a backup which is more resilient to hardware failure."
                )}
                <br></br>
                <br></br>
                {localize(
                  "You will also have an opportunity to record the corresponding public address for your private key. This is the address you can send bitcoin to for storage."
                )}
                <br></br>
                <br></br>
                <h1>
                  <strong>{localize("Best practices")}</strong>
                </h1>
                {localize(
                  "Trove works entirely offline and aims to guide the user in following best security practices."
                )}
                <br></br>
                <br></br>
                <h1>
                  <strong>{localize("Messages")}</strong>
                </h1>
                {localize(
                  "The tool allows for the creation of two types of message."
                )}
                <ul style="list-style: square; margin: 5px 20px;">
                  <li
                    innerHTML={localize(
                      "<strong>Instruction message</strong> - A message that is stored on each share. It serves as instructions as to who owns the share data and who is the custodian."
                    )}
                  ></li>
                  <li
                    innerHTML={localize(
                      "<strong>Reveal message</strong> - A message that is encrypted and only revealed when the shares are used to reveal the private key."
                    )}
                  ></li>
                </ul>
              </p>
            </div>
          </div>

          <div class="topic">
            <div class="topicHeading">
              <span>{localize("Some security considerations")}</span>
            </div>
            <div class="topicContent">
              <ul style="list-style: square; margin: 5px 20px;">
                <li>
                  {localize(
                    "You are trusting the Trove code. No audit has been done on the code."
                  )}
                </li>
                <li>
                  {localize(
                    "You are trusting the libraries that Trove depends on. These libraries have not been reviewed by the author of Trove."
                  )}
                </li>
                <li>
                  {localize(
                    "You are trusting the custodians to properly store the shares"
                  )}
                </li>
                <li>
                  {localize("You are trusting the custodians to not collude")}
                </li>
                <li>
                  {localize(
                    "Access to your bitcoin is limited by your access to the shares"
                  )}
                </li>
                <li>
                  {localize(
                    "Depending on your situation, there may be a better/simpler way of storing your bitcoin."
                  )}
                </li>
              </ul>
            </div>
          </div>

          <button
            class="button"
            onClick={(e) => {
              home.show();
            }}
          >
            {localize("Back home")}
          </button>
        </div>
      </div>
    );
  }
}
