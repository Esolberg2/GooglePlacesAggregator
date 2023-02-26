var md5 = require('md5');


// top and bottom scroll positions
const top = [686, 107]
const bottom = [546, 961]

it('Build search area, live, bulkSearch', { scrollBehavior: false }, () => {
  // load page

  cy.intercept('GET', 'https://maps.googleapis.com/maps/api/*').as('mapLibrary');
  cy.intercept({ method: 'PUT', url: ' http://localhost:3000/api/searchSession' }).as("routes");

  cy.visit('http://localhost:3000') // change URL to match your dev URL

  cy.get('[style="transition: all 100ms ease 0s; padding-top: 4px; padding-left: 52px;"]').click()

  cy.get('[style="flex: 1 1 0%; display: flex; flex-direction: row; align-items: flex-end;"] > input').type('AIz')

  cy.wait(500)
  cy.get('[style="width: 47px; height: 15px; visibility: visible;"]').click()

  // wait for map to initialize defualt location (Boston)
  cy.wait('@mapLibrary')

  cy.window().should('have.attr', 'google')

  // select an entity type
  cy.get('#typeSelect').select(75)

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

  cy.get(':nth-child(3) > input').type('4')

  cy.get(':nth-child(3) > button').click()

  cy.get('.ReactModal__Content > :nth-child(1)').click()

  cy.wait('@routes')
  cy.wait('@routes')
  cy.wait('@routes')
  cy.wait('@routes')

  cy.window().its('store').invoke('getState').then(state => {

    let searchedAreas = state.map.searchedAreas.features
    let coords = searchedAreas.map((region) => md5(JSON.stringify(region.geometry.coordinates)))
    let coordsSet = new Set(coords)

    cy.wrap(searchedAreas).as('searchedAreas')
    cy.wrap(coordsSet).as('coordsSet')

    cy.get('@coordsSet').should('have.length', 4)

    })

})
