# Retry Func

Wrap a function to support retry.

## Installation

```
npm install retry-func
```

## Usage

```
const retryFunc = require('retry-func')

async function someFunc(someArg1, someArg2, ...) {
  ...
}

const result = await retryFunc({maxTries: 3})(func)('arg1, 'arg2', ...)
```

## API

### retryFunc

- type: (options?) => (func) => func
- options:
  - maxTries?: Number = 3
  - shouldRetry?: (error) => Boolean - always return true by default
  - beforeTry?: ({tries, args}) => Void
    - tries: Number, current try count, from 1
    - args: Array

## License

MIT