import { ModalBuilder } from '../features/modal/ModalBuilder'
import { setBulkSearchRunning, searchPlaces, bulkSearch as bulkSearchThunk, nearbySearch, debounce } from '../features/search/searchSlice'
import { store } from '../store'
import { singleSearch } from './singleSearch'

const synchronizedCall = () => new Promise((resolve, reject) => {
  store.dispatch(bulkSearchThunk(resolve))
})

function bulkSearch() {
  let modalBuilder = new ModalBuilder()
  modalBuilder.alertKey = 'bulkSearch'

  // modalBuilder.callback = () => {
  //   store.dispatch(bulkSearchThunk())
  // }
  modalBuilder.callback = async () => {
    console.log("bulk search confirm")
    // for (let i=0; i < store.getState().search.bulkSearchCount; i++) {
    //   console.log(i)
    //   let data = await singleSearch()
    //   console.log(data)
    // }
  }
  modalBuilder.errorback = (error) => {
      console.log("reject callback run")
      console.log(error)
    }
  modalBuilder.run()
}

// export function debouncedBulkSearch() {
//   if (store.getState().search.bulkSearchRunning) {
//     console.log("abort bulk search")
//   } else {
//     bulkSearch()
//   }
//   // store.dispatch(debounce(bulkSearch()))
// }

// export async function debouncedBulkSearch() {
//
//   if (store.getState().search.bulkSearchRunning) {
//     console.log("abort single search")
//   }
//   else {
//     store.dispatch(setBulkSearchRunning(true))
//     for (let i=0; i < store.getState().search.bulkSearchCount; i++) {
//       console.log(i)
//       let data = await singleSearch()
//       console.log(data)
//     }
//     store.dispatch(setBulkSearchRunning(false))
//   }
// }

export async function debouncedBulkSearch() {

  if (store.getState().search.bulkSearchRunning) {
    console.log("abort single search")
  }
  else {
    store.dispatch(setBulkSearchRunning(true))
    await bulkSearch()
    store.dispatch(setBulkSearchRunning(false))
  }
}
