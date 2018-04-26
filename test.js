const retryFunc = require('./index')

describe('retryFunc', function () {
  it('should pass if no error', async () => {
    function func (arg) {
      return arg
    }

    const result = await retryFunc()(func)('hello')
    expect(result).toBe('hello')
  })

  it('should retry until pass', async () => {
    let firstRun = true

    function func (arg) {
      if (firstRun) {
        firstRun = false
        throw new Error('first run error')
      }
      return arg
    }

    const result = await retryFunc({maxTries: 3})(func)('hello')
    expect(result).toBe('hello')
    expect(firstRun).toBe(false)
  })

  it('should fail if always error', async () => {
    expect.assertions(2)

    let runCount = 0

    function func () {
      runCount++
      throw new Error('always error')
    }

    try {
      await retryFunc({maxTries: 2})(func)()
    } catch (err) {
      expect(err.message).toBe('always error')
    }
    expect(runCount).toBe(2)
  })
})
