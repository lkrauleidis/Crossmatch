import {CALENDAR_NAV_WEEK, CALENDAR_NAV_MONTH, CALENDAR_NAV_YEAR_MONTH, CALENDAR_NAV_START_LOADING, CALENDAR_NAV_END_LOADING} from '../../constants';

export function setWeek(week) {
	return {
    type: CALENDAR_NAV_WEEK,
    result: week
  };
}

export function setMonth(month) {
	return {
    type: CALENDAR_NAV_MONTH,
    result: month
  };
}

export function setYearMonth(yearMonth) {
	return {
    type: CALENDAR_NAV_YEAR_MONTH,
    result: yearMonth
  };
}

export function startNavLoading() {
  return {
    type: CALENDAR_NAV_START_LOADING,
    result: {}
  };
}

export function stopNavLoading() {
  return {
    type: CALENDAR_NAV_END_LOADING,
    result: {}
  };
}