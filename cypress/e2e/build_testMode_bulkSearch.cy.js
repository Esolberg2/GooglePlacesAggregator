// top and bottom scroll positions
const top = [686, 107]
const bottom = [546, 961]

it('Build search area, testMode, bulkSearch', { scrollBehavior: false }, () => {
  // load page

  cy.intercept('PUT', '/api/searchSession').as('route1');

  cy.visit('http://localhost:3000') // change URL to match your dev URL

  // wait for map to initialize defualt location (Boston)
  cy.wait(500)

  // select an entity type
  cy.get('#typeSelect').select(4)

  // scroll page to fully expose map
  cy.scrollTo(bottom[0], bottom[1])

  // wait for page to scroll into view
  cy.wait(2000)

  // click "select search area"
  cy.get('[style="padding: 10px; display: flex; flex-direction: row; align-items: flex-end;"] > :nth-child(1) > :nth-child(1)').click()

  // get reference to map element
  const mapComponent = cy.get('[style="height: 100vh; flex: 1 1 0%;"]')

  // select coordinates for search area
  mapComponent.click(453, 904)
  mapComponent.click(581, 699)
  mapComponent.click(639, 843)
  mapComponent.click(453, 904)

  // scroll setting buttons back into view
  cy.scrollTo(top[0], top[1])

  // set a max budget
  cy.get('[placeholder="Enter a max budget"]').type('1')

  // select build search
  cy.get('[style="display: flex; flex-direction: column; justify-content: flex-end;"] > :nth-child(1)').click()
})
