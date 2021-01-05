import {apiPath} from "configuration";
import authentication from "authentication";
import { error } from 'react-notification-system-redux';


function toSnakeCase(s) {
    return s.replace(/\.?([A-Z])/g, function (x,y){return "_" + y}).replace(/^_/, "").toUpperCase();
}

function handleError(dispatch) {
    return function(res) {
        if(!res.ok) {
            dispatch(error({
                autoDismiss: 5,
                message: "Could not fetch resource because of an network error",
            }));
            console.error(res);
            throw Error(res.statusText);
        }

        return res;
    }
}

function generalFetch(name, settings) {
  if(typeof settings === 'string') {
    settings = {path: settings};
  } else if(!settings) {
    settings = {};
  }
  const sname = toSnakeCase(name);
  let path = settings.path || `/${sname.toLowerCase()}`;
  let formatResult = settings.formatResult || ((x) => x);
  return function(deviceId) {
    deviceId = deviceId || "thermostat";
    const fetchStarted = () => ({
      type: "FETCH_" + sname + "_STARTED",
      device: deviceId,
      loading: true,
    });

    const fetchFailed = (error) => ({
      type: "FETCH_" + sname + "_FAILED",
      device: deviceId,
      loading: false,
      error: error
    });

    const fetchCompleted = (data) => ({
      type: "FETCH_" + sname + "_COMPLETED",
      device: deviceId,
      loading: false,
      payload: data,
    });
    
    return (dispatch, getState) => {
      dispatch(fetchStarted());
      return authentication.authorizedFetch(apiPath + path, { cache: 'no-cache', mode: 'cors' })
          .then(handleError(dispatch))
          .then(response => response.json())
          .then(json => {
              dispatch(fetchCompleted(formatResult(json)));
              return json;
          })
          .catch(error => dispatch(fetchFailed(error)));
      }
  }
}

export const fetchTemporaryTemperature = generalFetch('TemporaryTemperature', '/temporaryTemperature');
export const fetchCurrentTemperature = generalFetch('CurrentTemperature', '/temperature');
export const fetchState = generalFetch('CurrentTemperature', '/on');
export const fetchCurrentPlan = generalFetch('CurrentPlan', { path: '/plan', formatResult: (data) => ({
  name: "default",
  temperatures: data.plan,
})});

export function putTemporaryTemperature(temperature, duration, deviceId) {
    deviceId = deviceId || "thermostat";
    const name = "TemporaryTemperature";
    const sname = toSnakeCase(name);
    const now = (new Date(Date.now())).toISOString();

    return (dispatch, getState) => {
        dispatch({type: "POST_" + sname + "_STARTED", payload: {temperature, duration}});
        return authentication.authorizedFetch(apiPath + `/temporaryTemperature`, {
            method: 'PUT',
            cache: 'no-cache',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
            },
            redirect: 'follow',
            referrer: 'no-referrer',
            body: JSON.stringify({ temperature, duration, start: now }),
        })
        .then(handleError(dispatch))
        .then(() => {
            dispatch({
                type: "POST_" + sname + "_COMPLETED", 
                device: deviceId,
                payload: {temperature, duration, now}});
            return {temperature, duration, now};
        })
        .catch(error => dispatch({
            type: "POST_" + sname + "_FAILED", 
            device: deviceId,
            error:error }));
    }
}

export function resetTemporaryTemperature(currentUserTemperature, deviceId) {
    // TODO: remove currentUserTemperature
    deviceId = deviceId || "thermostat";
    const name = "TemporaryTemperature";
    const sname = toSnakeCase(name);
    const now = (new Date(Date.now())).toISOString();

    return (dispatch, getState) => {
        dispatch({type: "POST_" + sname + "_STARTED", payload: {temperature: currentUserTemperature, duration: 0}});
        return authentication.authorizedFetch(apiPath + `/temporaryTemperature`, {
            method: 'PUT',
            cache: 'no-cache',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
            },
            redirect: 'follow',
            referrer: 'no-referrer',
            body: JSON.stringify({ temperature: currentUserTemperature, duration: 0, start: now }),
        })
        .then(handleError(dispatch))
        .then(() => {
            dispatch({
                type: "POST_" + sname + "_COMPLETED", 
                device: deviceId,
                payload: {temperature: currentUserTemperature, duration: 0, now}});
            setTimeout(() => dispatch(fetchCurrentTemperature(deviceId)), 5000);
            return {temperature: currentUserTemperature, duration: 0, now};
        })
        .catch(error => dispatch({
            type: "POST_" + sname + "_FAILED", 
            device: deviceId,
            error:error }));
    }
}


export const fetchSettings = generalFetch('Settings', '/data/config.json');

export function postSettings(changes, deviceId) {
  deviceId = deviceId || "thermostat";
  const name = "Settings";
  const sname = "SETTINGS"
  return (dispatch, getState) => {
    dispatch({type: `POST_${name}_STARTED`, payload: changes, device: deviceId, loading: true });
    return authentication.authorizedFetch(apiPath + '/data/config.json', {
      method: 'GET',
      cache: 'no-cache',
      mode: 'cors',
      redirect: 'follow',
      referrer: 'no-referrer' })
    .then(handleError(dispatch))
    .then(response => response.json())
    .then(json => {
      const settings = Object.assign({}, json, changes);
      return authentication.authorizedFetch(apiPath + '/data/config.json', {
        method: 'PUT',
        cache: 'no-cache',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json',
        },
        redirect: 'follow',
        referrer: 'no-referrer',
        body: JSON.stringify(settings),
      })
      .then(handleError(dispatch))
      .then(() => {
        dispatch({
          type: `POST_${sname}_COMPLETED`,
          device: deviceId,
          loading: false,
          payload: data,
        })
      });
    });
  };
}

export function putCurrentPlan(plan, deviceId) {
    deviceId = deviceId || "thermostat";
    const name = "CurrentPlan";
    const sname = toSnakeCase(name);
    const now = (new Date(Date.now())).toISOString();

    return (dispatch, getState) => {
        dispatch({type: "POST_" + sname + "_STARTED", payload: plan});
        return authentication.authorizedFetch(apiPath + `/plan`, {
            method: 'PUT',
            cache: 'no-cache',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
            },
            redirect: 'follow',
            referrer: 'no-referrer',
            body: JSON.stringify({
                currentPlanId: 0,
                plan: plan.temperatures,
            }),
        })
        .then(handleError(dispatch))
        .then(() => {
            dispatch({type: "POST_" + sname + "_COMPLETED", device: deviceId});
            dispatch(fetchCurrentTemperature());
            return plan;
        })
        .catch(error => dispatch({type: "POST_" + sname + "_FAILED", error:error, device:deviceId }));
    }
}

export function putState(on, deviceId) {
    deviceId = deviceId || "thermostat";
    const name = "State";
    const sname = toSnakeCase(name);
    const now = (new Date(Date.now())).toISOString();

    return (dispatch, getState) => {
        dispatch({type: "POST_" + sname + "_STARTED", payload: { isOn: on }});
        return authentication.authorizedFetch(apiPath + `/on`, {
            method: 'POST',
            cache: 'no-cache',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
            },
            redirect: 'follow',
            referrer: 'no-referrer',
            body: JSON.stringify({ isOn: on }),
        })
        .then(handleError(dispatch))
        .then(response => response.json())
        .then((json) => {
            dispatch({type: "POST_" + sname + "_COMPLETED", device: deviceId, payload: json});
            dispatch(fetchCurrentTemperature());
            return json;
        })
        .catch(error => dispatch({type: "POST_" + sname + "_FAILED", device: deviceId, error:error }));
    }
}

