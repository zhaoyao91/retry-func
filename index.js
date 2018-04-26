function retryFunc (options = {}) {
  const {
    maxTries = 3,
    shouldRetry = function () {return true}
  } = options
  return function wrapFunc (func) {
    return async function wrappedFunc (...args) {
      let tries = 0
      while (true) {
        tries++
        try {
          return await func(...args)
        } catch (err) {
          if (tries === maxTries || !shouldRetry(err)) throw err
        }
      }
    }
  }
}

module.exports = retryFunc