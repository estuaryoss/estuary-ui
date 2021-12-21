describe('File Transfers', () => {
  beforeEach(() => {
    cy.on('uncaught:exception', (err, runnable) => {
      // returning false here prevents Cypress from
      // failing the test
      return false
    })

    cy.intercept('GET', '/about', {fixture: 'about.json'})

    cy.visit('http://localhost:8090/file-transfers')
  })

  it('the page title can be discovered', () => {
    cy.title().should('eq', 'Estuary UI')
  })

  it('the page top bar exists and has specific value', () => {
    cy.get('.q-toolbar__title').should('contain.text', 'Estuary-UI')
  })

  it('when loading table, it prints 2 entries', () => {
    cy.intercept('GET', '/agents/files', {fixture: 'file_transfers.json'})

    cy.get(':nth-child(3) > .q-table__bottom-item').contains("1-1 of 1")
  })

  it('when searching inside the table, it prints only one entry', () => {
    cy.intercept('GET', '/agents/files', {fixture: 'eureka_apps.json'})

    cy.get('.table-search-input').type('download')
    cy.get(':nth-child(3) > .q-table__bottom-item').contains("1-1 of 1")
    cy.get('.table-search-input').clear()
    cy.get(':nth-child(3) > .q-table__bottom-item').contains("1-1 of 1")
  })
})
