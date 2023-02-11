// import { ModalBuilder } from '../features/modal/ModalBuilder'
import { initializeSearch } from '../features/search/searchSlice'
import { store } from '../store'
import { buildModal } from '../features/modal/modalSlice'



// function buildSearch() {
//   let modalBuilder = new ModalBuilder()
//   modalBuilder.alertKey = 'buildSearch'
//   modalBuilder.callback = () => {
//     console.log("dispatched initializeSearch")
//     store.dispatch(initializeSearch())
//   }
//   modalBuilder.errorback = (error) => {
//       console.log("reject callback run")
//       console.log(error)
//     }
//   modalBuilder.run()
// }

// export function debouncedBuildSearch() {
//   if (store.getState().search.loading) {
//     console.log("abort build search")
//   } else {
//     store.dispatch(buildSearch)
//   }
// }



export async function debouncedBuildSearch() {
  if (store.getState().search.loading || store.getState().search.searchActive) {
    console.log("abort build search")
  } else {
    let selectedAction = await buildModal({
      "alertKey": 'buildSearch',
      "data": null,
      "confirmCallback": () => {
        console.log("buildSearch modal callback")
        store.dispatch(initializeSearch())
      },
      "denyCallback": (error) => {
        console.log("buildSearch modal error")
        console.log(error)
        }
    })
    console.log(selectedAction)
    selectedAction()
  }
}
