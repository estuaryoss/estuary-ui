describe('Eureka Apps', () => {
  beforeEach(() => {
    cy.on('uncaught:exception', (err, runnable) => {
      // returning false here prevents Cypress from
      // failing the test
      return false
    })

    cy.intercept('**/about', {fixture: 'about.json'})
  })

  it('the page title can be discovered', () => {
    cy.visit(Cypress.env('SERVICE_UI_URL') + '/eureka/applications')

    cy.title().should('eq', 'Estuary UI')
  })

  it('the page top bar exists and has specific value', () => {
    cy.visit(Cypress.env('SERVICE_UI_URL') + '/eureka/applications')

    cy.get('.q-toolbar__title').should('contain.text', 'Estuary-UI')
  })

  it('when loading table, it prints 2 entries', () => {
    cy.intercept('**/eureka/apps', {fixture: 'eureka_apps.json'})
    cy.visit(Cypress.env('SERVICE_UI_URL') + '/eureka/applications')

    cy.get(':nth-child(3) > .q-table__bottom-item').contains("1-2 of 2")
  })

  it('when searching inside the table, it prints only one entry', () => {
    cy.intercept('**/eureka/apps', {fixture: 'eureka_apps.json'})
    cy.visit(Cypress.env('SERVICE_UI_URL') + '/eureka/applications')

    cy.get('.table-search-input').type('discovery')
    cy.get(':nth-child(3) > .q-table__bottom-item').contains("1-1 of 1")
    cy.get('.table-search-input').clear()
    cy.get(':nth-child(3) > .q-table__bottom-item').contains("1-2 of 2")
  })
})
