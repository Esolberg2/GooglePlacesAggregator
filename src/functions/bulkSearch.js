import { ModalBuilder } from '../features/modal/ModalBuilder'
import { searchPlaces, bulkSearch as bulkSearchThunk, nearbySearch, debounce } from '../features/search/searchSlice'
import { store } from '../store'

// function bulkSearch() {
//   let modalBuilder = new ModalBuilder()
//   modalBuilder.alertKey = 'bulkSearch'
//   modalBuilder.callback = async () => {
//     for (let i = 0; i < store.getState().search.bulkSearchCount; i++) {
//       console.log(store.getState().search.unsearchedCoords.length)
//       if (store.getState().search.unsearchedCoords.length == 0) {
//         console.log("all coords searched")
//         break;
//       }
//       console.log("next search in progress")
//       await store.dispatch(nearbySearch())
//     }
//   }
//
//   modalBuilder.errorback = (error) => {
//       console.log("reject callback run")
//       console.log(error)
//     }
//   modalBuilder.run()
// }

const synchronizedCall = () => new Promise((resolve, reject) => {
  store.dispatch(searchPlaces(resolve))
})

function bulkSearch() {
  let modalBuilder = new ModalBuilder()
  modalBuilder.alertKey = 'bulkSearch'
  // modalBuilder.callback = () => {store.dispatch(bulkSearchThunk())}
  modalBuilder.callback = async () => {
    for (let i=0; i < 3; i++) {
      // await store.dispatch(searchPlaces())
      await synchronizedCall()
    }
  }
  modalBuilder.errorback = (error) => {
      console.log("reject callback run")
      console.log(error)
    }
  modalBuilder.run()
}

export function debouncedBulkSearch() {
  // store.dispatch(debounce(bulkSearch))
  bulkSearch()
}
