import { combineReducers } from 'redux';
import alert from './alert';
import auth from './auth'
import profile from './profiles';

export default combineReducers({
    alert, auth, profile
});