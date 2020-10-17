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

export function fetchTemporaryTemperature(deviceId) {
    deviceId = deviceId || "thermostat";
    const name = "TemporaryTemperature";
    const sname = toSnakeCase(name);
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
        return authentication.authorizedFetch(apiPath + `/device/${deviceId}/temporaryTemperature`, { cache: 'no-cache', mode: 'cors' })
            .then(handleError(dispatch))
            .then(response => response.json())
            .then(json => {
                dispatch(fetchCompleted(json));
                return json;
            })
            .catch(error => dispatch(fetchFailed(error)));
        }
}

export function fetchCurrentTemperature(deviceId) {
    deviceId = deviceId || "thermostat";
    const name = "CurrentTemperature";
    const sname = toSnakeCase(name);
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
        return authentication.authorizedFetch(apiPath + `/device/${deviceId}/temperature`, { cache: 'no-cache', mode: 'cors' })
            .then(handleError(dispatch))
            .then(response => response.json())
            .then(json => {
                dispatch(fetchCompleted(json));
                return json;
            })
            .catch(error => dispatch(fetchFailed(error)));
        }
}

export function fetchState(deviceId) {
    deviceId = deviceId || "thermostat";
    const name = "State";
    const sname = toSnakeCase(name);
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
        return authentication.authorizedFetch(apiPath + `/device/${deviceId}/on`, { cache: 'no-cache', mode: 'cors' })
            .then(handleError(dispatch))
            .then(response => response.json())
            .then(json => {
                dispatch(fetchCompleted(json));
                return json;
            })
            .catch(error => dispatch(fetchFailed(error)));
        }
}

export function fetchCurrentPlan(deviceId) {
    deviceId = deviceId || "thermostat";
    const name = "CurrentPlan";
    const sname = toSnakeCase(name);
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
        return authentication.authorizedFetch(apiPath + `/device/${deviceId}/plan`, { cache: 'no-cache', mode: 'cors' })
            .then(handleError(dispatch))
            .then(response => response.json())
            .then(json => {
                dispatch(fetchCompleted({
                    name: "default",
                    temperatures: json.plan,
                }));
            })
            .catch(error => dispatch(fetchFailed(error)));
        }
}

export function putTemporaryTemperature(temperature, duration, deviceId) {
    deviceId = deviceId || "thermostat";
    const name = "TemporaryTemperature";
    const sname = toSnakeCase(name);
    const now = (new Date(Date.now())).toISOString();

    return (dispatch, getState) => {
        dispatch({type: "POST_" + sname + "_STARTED", payload: {temperature, duration}});
        return authentication.authorizedFetch(apiPath + `/device/${deviceId}/temporaryTemperature`, {
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
        return authentication.authorizedFetch(apiPath + `/device/${deviceId}/temporaryTemperature`, {
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

export function putCurrentPlan(plan, deviceId) {
    deviceId = deviceId || "thermostat";
    const name = "CurrentPlan";
    const sname = toSnakeCase(name);
    const now = (new Date(Date.now())).toISOString();

    return (dispatch, getState) => {
        dispatch({type: "POST_" + sname + "_STARTED", payload: plan});
        return authentication.authorizedFetch(apiPath + `/device/${deviceId}/plan`, {
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
        return authentication.authorizedFetch(apiPath + `/device/${deviceId}/on`, {
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
