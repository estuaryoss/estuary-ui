describe('Contacts Page', () => {
  beforeEach(() => {
    cy.intercept('GET', '/about', {fixture: 'about.json'})

    cy.visit(Cypress.env('SERVICE_UI_URL') + '/contacts')
  })

  it('the page title can be discovered', () => {
    cy.title().should('eq', 'Estuary UI')
  })

  it('the page top bar exists and has specific value', () => {
    cy.get('.q-toolbar__title').should('contain.text', 'Estuary-UI')
  })

  it('the page has * contacts in the list', () => {
    cy.get('.q-item__label--header').should('contain.text', " CONTACTS")
  })

})
