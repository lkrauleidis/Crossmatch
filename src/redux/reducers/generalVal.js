import {SET_VIEWNAME, VIEWNAME_WEEK, VIEWNAME_MONTH, VIEWNAME_YEAR} from '../../constants';
var initialState = {};

export default function generalVal(state = initialState, action) {

	switch(action.type) {
		case SET_VIEWNAME:		  
			return {
				...state,
				viewName: action.result
			};

		default:
			return state;
	}

	return state;
}
