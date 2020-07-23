import {combineReducers} from 'redux'
import blogReducer from './blog'
import mapReducer from './map'
import chatroomReducer from './chatroom'
import userReducer from './user'

const rootReducer = combineReducers({
    blog: blogReducer,
    mapReducer,
    chatroomReducer,
    userReducer,
    imageReducer
})

export default rootReducer;