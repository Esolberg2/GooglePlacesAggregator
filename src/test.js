function loggerDecorator (logger) {
    return function (message) {
        logger.call(this, message)
        console.log("message logged at:", new Date().toLocaleString())
    }
}

@loggerDecorator
function say(message) {
  console.log(message)
}
