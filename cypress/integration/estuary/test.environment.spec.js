describe('Environment', () => {
  beforeEach(() => {
    cy.on('uncaught:exception', (err, runnable) => {
      // returning false here prevents Cypress from
      // failing the test
      return false
    })

    cy.intercept('GET', '/about', {fixture: 'about.json'})
  })

  it('the page title can be discovered', () => {
    cy.visit(Cypress.env('SERVICE_UI_URL') + '/env')

    cy.title().should('eq', 'Estuary UI')
  })

  it('the page top bar exists and has specific value', () => {
    cy.visit(Cypress.env('SERVICE_UI_URL') + '/env')

    cy.get('.q-toolbar__title').should('contain.text', 'Estuary-UI')
  })

  it('when loading table, it prints 2 entries', () => {
    cy.intercept('GET', '/agents/env', {fixture: 'environment.json'})
    cy.visit(Cypress.env('SERVICE_UI_URL') + '/env')

    cy.get(':nth-child(3) > .q-table__bottom-item').contains("1-2 of 2")
  })

  it('when searching inside the table, it prints only one entry', () => {
    cy.intercept('GET', '/agents/env', {fixture: 'environment.json'})
    cy.visit(Cypress.env('SERVICE_UI_URL') + '/env')

    cy.get('.table-search-input').type('BAR1')
    cy.get(':nth-child(3) > .q-table__bottom-item').contains("1-1 of 1")
    cy.get('.table-search-input').clear()
    cy.get(':nth-child(3) > .q-table__bottom-item').contains("1-2 of 2")
  })
})
