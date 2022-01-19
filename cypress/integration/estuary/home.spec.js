describe('Home Page', () => {
  beforeEach(() => {
    cy.on('uncaught:exception', (err, runnable) => {
      // returning false here prevents Cypress from
      // failing the test
      return false
    })

    cy.intercept('GET', '/about', {fixture: 'about.json'})
  })

  it('the page title can be discovered', () => {
    cy.visit(Cypress.env('SERVICE_UI_URL'))

    cy.title().should('eq', 'Estuary UI')
  })

  it('the page top bar exists and has specific value', () => {
    cy.visit(Cypress.env('SERVICE_UI_URL'))

    cy.get('.q-toolbar__title').should('contain.text', 'Estuary-UI')
  })

  it('the backend info button should exists', () => {
    cy.visit(Cypress.env('SERVICE_UI_URL'))

    cy.findAllByText('Backend info').click().should('exist')
  })

  it('the backend info tooltip associated with the button should exist', () => {
    cy.visit(Cypress.env('SERVICE_UI_URL'))

    cy.findAllByText('Backend info').click()
    cy.get('.bg-accent').should('exist')
  })
})
