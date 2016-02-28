import createLogger from 'redux-logger'
import promiseMiddleware from 'redux-promise-middleware'
import thunkMiddleware from 'redux-thunk'
import { isBrowser } from 'app/utils/predicates'
import { socket } from 'app/services/socket'
import { outClientViaSocketIO } from 'redux-via-socket.io'
import { syncHistory } from 'react-router-redux'
import { history } from 'app/services/history'
import rootSaga from 'app/sagas'
import createSagaMiddleware from 'redux-saga'

const log = {
  action: debug('DISPATCH:'),
}
export const defaultMiddleware = [
  thunkMiddleware,
  promiseMiddleware(),
  createSagaMiddleware(rootSaga),
]
export const middleware = [
  ...defaultMiddleware,
]
// unused export, listenForReplays is currently buggy...
export const routerReduxMiddleware = syncHistory(history)

if (isBrowser()) {
  middleware.push(
    routerReduxMiddleware,
    outClientViaSocketIO(socket),
    createLogger({
      predicate: () => process.env.NODE_ENV === 'development',
      collapsed: true,
    })
  )
} else {
  middleware.push(
    () => next => action => {
      if (!action.MONITOR_ACTION)
        log.action(action)
      next(action)
    }
  )
}