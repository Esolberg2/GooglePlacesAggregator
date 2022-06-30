async function removeGoogle() {
  await delete window.google
  let scripts = document.getElementsByTagName('script')
  for await (const element of [...scripts]) {
    if (element.src.includes('https://maps.googleapis.com')) {
      element.parentNode.removeChild(element)
    }
  }
  console.log("done removing google")
}

async function addGoogle(apiKey) {
  let s = document.createElement('script');
  s.type = 'text/javascript';
  s.src = `https://maps.googleapis.com/maps/api/js?key=` + apiKey + `&libraries=places`;
  s.id = 'googleMaps';
  s.async = false;
  s.defer = false;
  let node = await document.head.appendChild(s);
  console.log("done adding google")
}


// export async function updateGoogleApi(apiKey) {
//   console.log('updateGoogleApi')
//   try {
//     await removeGoogle()
//     await addGoogle(apiKey)
//     return true
//   } catch (error){
//     return false
//   }
// }
function timeout(ms) {
  return new Promise((resovle) => {
    setTimeout(resovle, ms);
  })
}

export async function updateGoogleApi(apiKey) {
  console.log('called')
  const done = await timeout(1000)
  try {
    console.log("trying")
    await removeGoogle()
    await addGoogle(apiKey)
    console.log("complete")
    return true
  } catch (error){
    return false
  }
}

// export async function updateGoogleApi(apiKey) {
//   console.log('updateGoogleApi')
//   try {
//     await removeGoogle()
//     await addGoogle(apiKey)
//     return true
//   } catch (error){
//     return false
//   }
// }
