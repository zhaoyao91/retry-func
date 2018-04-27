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
        let success
        let result
        let error
        let willRetry
        try {
          result = await func(...args)
          success = true
          willRetry = false
        } catch (err) {
          success = false
          error = err
          willRetry = tries !== maxTries && shouldRetry(err)
        }
        afterTry({tries, args, success, result, error, willRetry})
        if (success) return result
        else if (!willRetry) throw error
      }
    }
  }
}

module.exports = retryFunc
