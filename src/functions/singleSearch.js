// import { ModalBuilder } from '../features/modal/ModalBuilder'
import { search, searchPlaces, singleSearch as singleSearchThunk } from '../features/search/searchSlice'
import { store } from '../store'
import { googlePlacesApiManager } from '../googleAPI/googlePlacesApiManager'
import { buildModal } from '../features/modal/modalSlice'


// const synchronizedCall = () => new Promise((resolve, reject) => {
//   store.dispatch(searchPlaces(resolve))
// })

// export async function singleSearch() {
//   console.log("single search local")
//   let modalBuilder = new ModalBuilder()
//   modalBuilder.alertKey = 'search'
//   modalBuilder.callback = async () => {
//     let result = await store.dispatch(singleSearchThunk())
//     console.log("result", result)
//   }
//   modalBuilder.errorback = (error) => {
//     console.log("reject callback run")
//     console.log(error)
//     }
//
//   let modalResponse = await modalBuilder.run()
//   console.log(modalResponse)
//   return modalResponse
// }

// export async function debouncedSingleSearch() {
//   if (store.getState().search.loading) {
//     console.log("abort single search")
//   } else {
//     let data = await singleSearch()
//     console.log(data)
//     return data
//     // store.dispatch(singleSearch())
//   }
// }

// export async function debouncedSingleSearch() {
//   if (store.getState().search.loading) {
//     console.log("abort single search")
//   } else {
//     search()
//   }
// }

export async function debouncedSingleSearch() {
  if (store.getState().search.loading) {
    console.log("abort single search")
  } else {

    let selectedAction = await buildModal({
      "alertKey": 'search',
      "data": null,
      "confirmCallback": () => {
        console.log("singleSearch modal callback")
        return store.dispatch(searchPlaces())
      },
      "denyCallback": (error) => {
        console.log("singleSearch modal error")
        console.log(error)
        }
    })
    console.log(selectedAction)
    console.log("started")
    console.log(await selectedAction())
    console.log("ended")
  }
}
