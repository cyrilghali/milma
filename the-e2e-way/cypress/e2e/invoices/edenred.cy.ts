// https://partenaire.edenred.fr/s/activite-factures
/*
 * <lightning-input c-epmhome_epmhome="" class="login slds-form-element" lwc-66unc5l95ad-host=""><lightning-primitive-input-simple lwc-66unc5l95ad="" aria-errormessage="help-message-9" lwc-enmikoh2qu-host="" variant="standard"><div lwc-enmikoh2qu="" part="input-text"><label lwc-enmikoh2qu="" class="slds-form-element__label slds-no-flex" for="input-10" part="label"></label><div lwc-enmikoh2qu="" class="slds-form-element__control slds-grow" part="input-container" type="text"><input lwc-enmikoh2qu="" class="slds-input" aria-errormessage="help-message-10" id="input-10" part="input" placeholder="Adresse email" type="text"></div></div></lightning-primitive-input-simple></lightning-input>*/
describe("Swile invoices", () => {
  let table: Array<unknown>;
  let directLink: string;
  it("should login and go to invoices page", () => {
    const username = Cypress.env("edenredmail");
    const password = Cypress.env("edenredpassword");
    cy.visit("https://partenaire.edenred.fr/s/")
      .get("#onetrust-accept-btn-handler")
      .click()
      .then(() => {
        // <lightning-input>
        cy.xpath(`//*[@id="input-10"]`).type(username);
        cy.xpath(`//*[@id="input-12"]`).type(password);
        cy.xpath(`//*[@id="connectionButton-7"]/button`).click();
      })
      .then(() => {
        cy.url().should("contain", "/s/accueil");
        cy.visit("https://partenaire.edenred.fr/s/activite-factures");
        cy.intercept(
          "POST",
          "https://partenaire.edenred.fr/s/sfsites/aura?r=9&aura.ApexAction.execute=1",
          (req) => {
            req.continue((res) => {
              expect(res.statusCode).to.eq(200);
              expect(res.body).to.have.property("actions");
              expect(res.body.actions[0]).to.have.property("returnValue");
              expect(res.body.actions[0].returnValue).to.have.property(
                "returnValue",
              );
              table = res.body.actions[0].returnValue.returnValue;
            });
          },
        ).as("getInvoices");
      })
      .then(() => {
        cy.wait("@getInvoices");
        cy.xpath(`//*[@id="facturesList-6"]/tbody/tr[4]`).click();
        cy.url().should("contain", "/s/facture-details");
        cy.wait(5000);
        cy.xpath(`//*[@id="downloadDuplicata-7"]`)
          .click()
          .intercept("POST", "/s/sfsites/aura**", (req) => {
            req.continue((res) => {
              expect(res.statusCode).to.eq(200);
              expect(res.body).to.have.property("actions");
              expect(res.body.actions[0]).to.have.property("returnValue");
              expect(res.body.actions[0].returnValue).to.have.property(
                "returnValue",
              );
              expect(
                res.body.actions[0].returnValue.returnValue,
              ).to.have.property("file");
              expect(
                res.body.actions[0].returnValue.returnValue.file,
              ).to.have.property("direct_link");

              directLink =
                res.body.actions[0].returnValue.returnValue.file.direct_link;
            });
          })
          .as("getInvoice");
      });
  });
  after(() => {
    console.log("Response:", table);
    console.log("Direct link:", directLink);
  });
});
