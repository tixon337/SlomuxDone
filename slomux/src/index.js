import React, { useMemo, useReducer } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import * as serviceWorker from './serviceWorker';

// Slomux - реализация Flux, в которой, как следует из названия, что-то сломано.
// Нужно починить то, что сломано, и подготовить Slomux к использованию на больших проектах, где крайне важна производительность

// ВНИМАНИЕ! Замена slomux на готовое решение не является решением задачи

const createStore = (reducer, initialState) => {
  let currentState = initialState
  let listeners = []

  const getState = () => currentState
  const dispatch = action => {
    currentState = reducer(currentState, action)
    listeners.forEach(listener => listener())
  }

  const subscribe = listener => listeners.push(listener)

  return { getState, dispatch, subscribe }
}

const defaultState = {
  counter: 1,
  stepSize: 1,
}

const reducer = (state = defaultState, action) => {
  switch (action.type) {
    case UPDATE_COUNTER:
      return {
        ...state,
        counter: state.counter + action.payload
      }
    case CHANGE_STEP_SIZE:
      return {
        ...state,
        stepSize: action.payload
      }
    default:
      return state
  }
}


const store = createStore(reducer, defaultState);
const context = React.createContext();


const useSelector = selector => {
  const [, forceRender] = useReducer(s => s + 1, 0)
  const ctx = React.useContext(context)
  const subscription = useMemo(() => ctx.store.subscribe(() => {
    forceRender();
  }), []);
  if (!ctx) {
    return 0
  }

  return selector(ctx.store.getState())
}



const useDispatch = () => {
  const ctx = React.useContext(context)
  if (!ctx) {
    return () => { }
  }

  return ctx.store.dispatch
}

const Provider = ({ store, context, children }) => {
  const Context = context || React.createContext(null)

  return <Context.Provider value={{ store }}>{children}</Context.Provider>
}

// APP

// actions
const UPDATE_COUNTER = 'UPDATE_COUNTER'
const CHANGE_STEP_SIZE = 'CHANGE_STEP_SIZE'

// action creators
const updateCounter = value => {
  return {
    type: UPDATE_COUNTER,
    payload: value,
  }
}

const changeStepSize = value => {
  return {
    type: CHANGE_STEP_SIZE,
    payload: value,
  }
}


// reducers





// ВНИМАНИЕ! Использование собственной реализации useSelector и dispatch обязательно
const Counter = () => {
  const counter = useSelector(state => state.counter)
  const stepS = useSelector(state => state.stepSize)
  const dispatch = useDispatch()

  return (
    <div>
      <button onClick={() => dispatch(updateCounter(-stepS))}>-</button>
      <span> {counter} </span>
      <button onClick={() => { dispatch(updateCounter(stepS)) }}>+</button>
    </div>
  )
}

const Step = () => {
  const stepSize = useSelector(state => state.stepSize, (current, prev) => current === prev)
  const dispatch = useDispatch()


  return (
    <div>
      <div>Значение счётчика должно увеличиваться или уменьшаться на заданную величину шага</div>
      <div>Текущая величина шага: {stepSize}</div>
      <input
        type="range"
        min="1"
        max="5"
        value={stepSize}
        onChange={({ target }) => dispatch(changeStepSize(Number.parseInt(target.value)))}
      />
    </div>
  )
}

ReactDOM.render(
  <Provider store={store} context={context}>
    <Step />
    <Counter />
  </Provider>,
  document.getElementById('root')
)
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
