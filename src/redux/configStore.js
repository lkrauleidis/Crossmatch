import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import thunkMiddleware from 'redux-thunk';
import promiseMiddleware from './middlewares/promiseMiddleware';
import * as reducers from './reducers/';
import {persistStore, autoRehydrate} from 'redux-persist'
import {AsyncStorage} from 'react-native';

export default function configureStore() {
	const createStoreWithMiddleware = applyMiddleware(thunkMiddleware, promiseMiddleware)(createStore);
	const store = createStoreWithMiddleware(combineReducers(reducers));
	persistStore(store, {whitelist: ['auth'], storage: AsyncStorage});
    return store;
}
