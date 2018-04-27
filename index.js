function retryFunc (options = {}) {
  const {
    maxTries = 3,
    shouldRetry = function () {return true},
    beforeTry = function () {},
    afterTry = function () {}
  } = options
  return function wrapFunc (func) {
    return async function wrappedFunc (...args) {
      let tries = 0
      let error = null
      while (true) {
        tries++
        beforeTry({tries, args})
        try {
          return await func(...args)
        } catch (err) {
          error = err
          if (tries === maxTries || !shouldRetry(err)) throw err
        }
      }
    }
  }
}

module.exports = retryFunc

// beforeTry ({tries, args})
// afterTry ({tries, args, success, result, error, willRetry})