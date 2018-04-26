function retryFunc (options = {}) {
  const {
    maxTries = 3,
  } = options
  return function wrapFunc (func) {
    return async function wrappedFunc (...args) {
      let tries = 0
      while (true) {
        tries++
        try {
          return await func(...args)
        } catch (err) {
          if (tries === maxTries) throw err
        }
      }
    }
  }
}

module.exports = retryFunc