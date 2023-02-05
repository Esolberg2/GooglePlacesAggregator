describe('The Home Page', () => {

  // top and bottom scroll positions
  const top = [686, 107]
  const bottom = [546, 961]

  it('Build search area test mode single search', { scrollBehavior: false }, () => {
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

    cy.window().its('store').invoke('getState').then(state => {
      let polygonCoordinates = {polygonCoordinates: state.map.polygonCoordinates}
      cy.wrap(polygonCoordinates).as('polygonCoordinates')

      let mapPolygons = state.map.mapPolygons
      cy.wrap(mapPolygons).as('mapPolygons')
    })

  cy.get('@polygonCoordinates').should(
    'deep.equal',
    {
      polygonCoordinates: [
          [
              [
                  -71.17960562614029,
                  42.266617418822946
              ],
              [
                  -71.05188956168715,
                  42.297605943816635
              ],
              [
                  -71.09171500114009,
                  42.37069872097572
              ],
              [
                  -71.17960562614029,
                  42.266617418822946
              ]
          ]
      ]
    }
  )

  cy.get('@mapPolygons').should(
    'deep.equal',
    [{
      type: "Feature",
      properties: {},
      geometry: {
          type: "Polygon",
          coordinates: [
              [
                  [
                      -71.17960562614029,
                      42.266617418822946
                  ],
                  [
                      -71.05188956168715,
                      42.297605943816635
                  ],
                  [
                      -71.09171500114009,
                      42.37069872097572
                  ],
                  [
                      -71.17960562614029,
                      42.266617418822946
                  ]
              ]
          ]
      }
    }]
  )

  cy.get('[style="display: flex; flex-direction: column; justify-content: flex-end;"] > :nth-child(2)').click().then(() => {
     cy.wait('@route1').then(() => {

       cy.get('[style="display: flex; flex-direction: column; justify-content: flex-end;"] > :nth-child(2)').click()
       .then(() => {
         cy.wait('@route1').then(() => {
           cy.window().its('store').invoke('getState').then(state => {

             let searchedAreas = state.map.searchedAreas.features
             let searchedAreas1 = searchedAreas[1]
             let searchedAreas0 = searchedAreas[0]
             cy.wrap(searchedAreas).as('searchedAreas')
             cy.wrap(searchedAreas0).as('searchedAreas0')
             cy.wrap(searchedAreas1).as('searchedAreas1')
             cy.get('[style="display: flex; flex-direction: column; justify-content: flex-end;"] > :nth-child(2)').click().then(() => {
               cy.window().its('store').invoke('getState')
             })
             cy.get('@searchedAreas').should('have.length', 2)

             cy.get('@searchedAreas0').should(
               'not.deep.equal', searchedAreas1)

           })
         })
       })
     })
  })

  })
})
