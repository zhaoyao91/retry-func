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

  it('should fail if should retry return true', async () => {
    expect.assertions(1)

    let runCount = 0

    function func () {
      runCount++
      throw new Error(`error ${runCount}`)
    }

    try {
      await retryFunc({
        maxTries: 5,
        shouldRetry: (err) => !err.message.endsWith('4')
      })(func)()
    } catch (err) {
      expect(err.message).toBe('error 4')
    }
  })

  it('should call beforeTry properly', async () => {
    expect.assertions(2)
    const records = []

    let runCount = 0

    function func () {
      runCount++
      throw new Error(`${runCount}`)
    }

    function beforeTry ({tries, args}) {
      records.push(tries, args)
    }

    try {
      await retryFunc({
        maxTries: 3,
        beforeTry
      })(func)(runCount)
    } catch (err) {
      expect(err.message).toBe('3')
    }

    expect(records).toEqual([1, [0], 2, [0], 3, [0]])
  })

  it('should call afterTry properly: success', async () => {
    const records = []

    let runCount = 0

    function func () {
      runCount++
      if (runCount < 2) throw new Error(`${runCount}`)
      else return runCount
    }

    function afterTry (arg) {
      records.push(arg)
    }

    const result = await retryFunc({
      maxTries: 3,
      afterTry
    })(func)('hello')
    expect(result).toBe(2)
    expect(records).toEqual([
      {tries: 1, args: ['hello'], success: false, error: new Error('1'), willRetry: true},
      {tries: 2, args: ['hello'], success: true, result: 2, willRetry: false},
    ])
  })

  it('should call afterTry properly: not failure', async () => {
    const records = []

    let runCount = 0

    function func () {
      runCount++
      throw new Error(`${runCount}`)
    }

    function afterTry (arg) {
      records.push(arg)
    }

    try {
      await retryFunc({
        maxTries: 3,
        afterTry
      })(func)('hello')
    } catch (err) {
      expect(err.message).toBe('3')
    }
    expect(records).toEqual([
      {tries: 1, args: ['hello'], success: false, error: new Error('1'), willRetry: true},
      {tries: 2, args: ['hello'], success: false, error: new Error('2'), willRetry: true},
      {tries: 3, args: ['hello'], success: false, error: new Error('3'), willRetry: false}
    ])
  })
})
