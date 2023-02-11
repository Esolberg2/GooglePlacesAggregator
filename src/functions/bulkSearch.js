// import { ModalBuilder } from '../features/modal/ModalBuilder'
import { search, setBulkSearchRunning, searchPlaces, nearbySearch, debounce } from '../features/search/searchSlice'
import { store } from '../store'
import { singleSearch, debouncedSingleSearch } from './singleSearch'
import { buildModal } from '../features/modal/modalSlice'

// const synchronizedCall = () => new Promise((resolve, reject) => {
//   store.dispatch(bulkSearchThunk(resolve))
// })

// function bulkSearch() {
//   let modalBuilder = new ModalBuilder()
//   modalBuilder.alertKey = 'bulkSearch'
//
//   modalBuilder.callback = async () => {
//     await store.dispatch(bulkSearchThunk())
//   }
//   modalBuilder.errorback = (error) => {
//       console.log("reject callback run")
//       console.log(error)
//     }
//   let data = modalBuilder.run()
//   console.log(data)
//   return data
// }

// export async function debouncedBulkSearch() {
//   console.log(store.getState().search.bulkSearchRunning)
//   if (store.getState().search.bulkSearchRunning) {
//     console.log("abort bulk search")
//   }
//   else {
//     bulkSearch()
// }
// }
//
// export async function debouncedBulkSearch() {
//   search(2)
// }

// export async function debouncedBulkSearch() {
//   let modalBuilder = new ModalBuilder()
//   modalBuilder.alertKey = 'bulkSearch'
//
//   modalBuilder.callback = async () => {
//     store.dispatch(bulkSearchThunk())
//   }
//   modalBuilder.errorback = (error) => {
//       console.log("reject callback run")
//       console.log(error)
//     }
//   let data = modalBuilder.run()
//   console.log(data)
//   return data
// }


export async function debouncedBulkSearch() {
  if (store.getState().search.bulkSearchRunning) {
    console.log("aborting bulk search")
    return
  } else {
    store.dispatch(setBulkSearchRunning(true))

    let selectedAction = await buildModal({
      "alertKey": 'bulkSearch',
      "data": null,
      "confirmCallback": async () => {
        for (let i=0; i < 10; i++) {
          await debouncedSingleSearch()
        }
      },
      "denyCallback": (error) => {
        console.log("bulkSearch modal error")
        console.log(error)
        }
    })
    console.log(selectedAction)
    console.log("started")
    console.log(await selectedAction())
    console.log("ended")

    store.dispatch(setBulkSearchRunning(false))
  }
}
