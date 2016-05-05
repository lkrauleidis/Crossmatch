import {SET_VIEWNAME, VIEWNAME_WEEK, VIEWNAME_MONTH, VIEWNAME_YEAR} from '../../constants';
import _ from 'lodash';

/* ... */


/**
*  Set the values of all children changed
*/
export function setViewName(viewName) {
	return (dispatch) => {

		dispatch({
      type: SET_VIEWNAME,
      result: viewName
    });

	};
}
