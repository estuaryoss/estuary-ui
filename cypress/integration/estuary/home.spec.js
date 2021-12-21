describe('Home Page', () => {
  beforeEach(() => {
    cy.on('uncaught:exception', (err, runnable) => {
      // returning false here prevents Cypress from
      // failing the test
      return false
    })

    cy.intercept('GET', '/about', {fixture: 'about.json'})

    cy.visit('http://localhost:8080')
  })

  it('the page title can be discovered', () => {
    cy.title().should('eq', 'Estuary UI')
  })

  it('the page top bar exists and has specific value', () => {
    cy.get('.q-toolbar__title').should('contain.text', 'Estuary-UI')
  })

  it('the backend info button should exists', () => {
    cy.findAllByText('Backend info').click().should('exist')
  })

  it('the backend info tooltip associated with the button should exist', () => {
    cy.findAllByText('Backend info').click()
    cy.get('.bg-accent').should('exist')
  })
})
