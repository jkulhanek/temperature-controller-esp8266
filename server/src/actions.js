import {apiPath} from "configuration";
import authentication from "authentication";

function toSnakeCase(s) {
    return s.replace(/\.?([A-Z])/g, function (x,y){return "_" + y}).replace(/^_/, "").toUpperCase();
}

function handleError(res) {
    if(!res.ok) {
        throw Error(res.statusText);
    }

    return res;
}

export function fetchTemporaryTemperature() {
    const name = "TemporaryTemperature";
    const sname = toSnakeCase(name);
    const fetchStarted = () => ({
        type: "FETCH_" + sname + "_STARTED",
        loading: true,
    });

    const fetchFailed = (error) => ({
        type: "FETCH_" + sname + "_FAILED",
        loading: false,
        error: error
    });

    const fetchCompleted = (data) => ({
        type: "FETCH_" + sname + "_COMPLETED",
        loading: false,
        payload: data,
    });
    
    return (dispatch, getState) => {
        dispatch(fetchStarted());
        return authentication.authorizedFetch(apiPath + "/temporaryTemperature", { cache: 'no-cache', mode: 'cors' })
            .then(handleError)
            .then(response => response.json())
            .then(json => {
                dispatch(fetchCompleted(json));
                return json;
            })
            .catch(error => dispatch(fetchFailed(error)));
        }
}

export function fetchCurrentTemperature() {
    const name = "CurrentTemperature";
    const sname = toSnakeCase(name);
    const fetchStarted = () => ({
        type: "FETCH_" + sname + "_STARTED",
        loading: true,
    });

    const fetchFailed = (error) => ({
        type: "FETCH_" + sname + "_FAILED",
        loading: false,
        error: error
    });

    const fetchCompleted = (data) => ({
        type: "FETCH_" + sname + "_COMPLETED",
        loading: false,
        payload: data,
    });
    
    return (dispatch, getState) => {
        dispatch(fetchStarted());
        return authentication.authorizedFetch(apiPath + "/temperature", { cache: 'no-cache', mode: 'cors' })
            .then(handleError)
            .then(response => response.json())
            .then(json => {
                dispatch(fetchCompleted(json));
                return json;
            })
            .catch(error => dispatch(fetchFailed(error)));
        }
}

export function fetchState() {
    const name = "State";
    const sname = toSnakeCase(name);
    const fetchStarted = () => ({
        type: "FETCH_" + sname + "_STARTED",
        loading: true,
    });

    const fetchFailed = (error) => ({
        type: "FETCH_" + sname + "_FAILED",
        loading: false,
        error: error
    });

    const fetchCompleted = (data) => ({
        type: "FETCH_" + sname + "_COMPLETED",
        loading: false,
        payload: data,
    });
    
    return (dispatch, getState) => {
        dispatch(fetchStarted());
        return authentication.authorizedFetch(apiPath + "/on", { cache: 'no-cache', mode: 'cors' })
            .then(handleError)
            .then(response => response.json())
            .then(json => {
                dispatch(fetchCompleted(json));
                return json;
            })
            .catch(error => dispatch(fetchFailed(error)));
        }
}

export function fetchCurrentPlan() {
    const name = "CurrentPlan";
    const sname = toSnakeCase(name);
    const fetchStarted = () => ({
        type: "FETCH_" + sname + "_STARTED",
        loading: true,
    });

    const fetchFailed = (error) => ({
        type: "FETCH_" + sname + "_FAILED",
        loading: false,
        error: error
    });

    const fetchCompleted = (data) => ({
        type: "FETCH_" + sname + "_COMPLETED",
        loading: false,
        payload: data,
    });
    
    return (dispatch, getState) => {
        dispatch(fetchStarted());
        return authentication.authorizedFetch(apiPath + "/plan", { cache: 'no-cache', mode: 'cors' })
            .then(handleError)
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

export function putTemporaryTemperature(temperature, duration) {
    const name = "TemporaryTemperature";
    const sname = toSnakeCase(name);
    const now = (new Date(Date.now())).toISOString();

    return (dispatch, getState) => {
        dispatch({type: "POST_" + sname + "_STARTED", payload: {temperature, duration}});
        return authentication.authorizedFetch(apiPath + "/temporaryTemperature", {
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
        .then(handleError)
        .then(() => {
            dispatch({type: "POST_" + sname + "_COMPLETED", payload: {temperature, duration, now}});
            return {temperature, duration, now};
        })
        .catch(error => dispatch({type: "POST_" + sname + "_FAILED", error:error }));
    }
}

export function putCurrentPlan(plan) {
    const name = "CurrentPlan";
    const sname = toSnakeCase(name);
    const now = (new Date(Date.now())).toISOString();

    return (dispatch, getState) => {
        dispatch({type: "POST_" + sname + "_STARTED", payload: plan});
        return authentication.authorizedFetch(apiPath + "/plan", {
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
        .then(handleError)
        .then(() => {
            dispatch({type: "POST_" + sname + "_COMPLETED"});
            dispatch(fetchCurrentTemperature());
            return plan;
        })
        .catch(error => dispatch({type: "POST_" + sname + "_FAILED", error:error }));
    }
}

export function putState(on) {
    const name = "State";
    const sname = toSnakeCase(name);
    const now = (new Date(Date.now())).toISOString();

    return (dispatch, getState) => {
        dispatch({type: "POST_" + sname + "_STARTED", payload: { isOn: on }});
        return authentication.authorizedFetch(apiPath + "/on", {
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
        .then(handleError)
        .then(response => response.json())
        .then((json) => {
            dispatch({type: "POST_" + sname + "_COMPLETED", payload: json});
            dispatch(fetchCurrentTemperature());
            return json;
        })
        .catch(error => dispatch({type: "POST_" + sname + "_FAILED", error:error }));
    }
}