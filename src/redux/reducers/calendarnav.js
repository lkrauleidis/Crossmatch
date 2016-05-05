import moment from 'moment';

import {CALENDAR_NAV_WEEK, CALENDAR_NAV_MONTH, CALENDAR_NAV_YEAR_MONTH, CALENDAR_NAV_START_LOADING, CALENDAR_NAV_END_LOADING} from '../../constants';

var initialState = { startingWeek: moment().startOf('week').add(1, 'day'), startingMonth: moment().startOf('month'), startingYearMonth: moment().startOf('month'), loading: false};

export default function calendarnav(state = initialState, action) {
	switch(action.type) {
		case CALENDAR_NAV_WEEK:
			return {
				...state,
				startingWeek: action.result
			};
		case CALENDAR_NAV_MONTH:
			return {
				...state,
				startingMonth: action.result
			};
		case CALENDAR_NAV_YEAR_MONTH:
			return {
				...state,
				startingYearMonth: action.result
			};
		case CALENDAR_NAV_START_LOADING:
			return {
				...state,
				loading: true
			}
		case CALENDAR_NAV_END_LOADING:
			return {
				...state,
				loading: false
			}
		default: 
			return state;
	}
	return state;
}