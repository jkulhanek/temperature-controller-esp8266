'use strict';
const timeout = ms => new Promise(res => setTimeout(res, ms))

function toSnakeCase(s) {
    return s.replace(/\.?([A-Z])/g, function (x,y){return "_" + y}).replace(/^_/, "").toUpperCase();;
}

export function fetchTemporaryTemperature() {
    const name = "TemporaryTemperature";
    const sname = toSnakeCase(name);
    const fetchStarted = () => ({
        type: "FETCH_" + sname + "_STARTED",
    });

    const fetchFailed = (error) => ({
        type: "FETCH_" + sname + "_FAILED",
        error: error
    });

    const fetchCompleted = (data) => ({
        type: "FETCH_" + sname + "_COMPLETED",
        payload: data,
    });

    const json = {temperature:18.2, start: 1567006067405, duration: 3600*1000 };

    return (dispatch, getState) => {
        dispatch(fetchStarted());
        return timeout(500)
            .then(() => {
                dispatch(fetchCompleted(json));
                return json;
            });
        }
}

export function fetchCurrentTemperature() {
    const name = "CurrentTemperature";
    const sname = toSnakeCase(name);
    const fetchStarted = () => ({
        type: "FETCH_" + sname + "_STARTED",
    });

    const fetchFailed = (error) => ({
        type: "FETCH_" + sname + "_FAILED",
        error: error
    });

    const fetchCompleted = (data) => ({
        type: "FETCH_" + sname + "_COMPLETED",
        payload: data,
    });

    const json = {userTemperature: 0.00, temperature: Math.random() * 20 + 10, start: new Date(1567006067405).toUTCString(), duration: 3600*1000 };

    return (dispatch, getState) => {
        dispatch(fetchStarted());
        return timeout(500)
            .then(() => {
                dispatch(fetchCompleted(json));
                return json;
            });
        }
}

export function putTemporaryTemperature(temperature, duration) {
    const name = "TemporaryTemperature";
    const sname = toSnakeCase(name);
    const now =(new Date(Date.now())).toISOString();

    return (dispatch, getState) => {
        dispatch({type: "POST_" + sname + "_STARTED", payload: {temperature, duration}});
        return timeout(500)
            .then(() => {
                dispatch({type: "POST_" + sname + "_COMPLETED", payload: {temperature, duration, now}});
                return {temperature, duration, now};
            });
    }
}

export function putPlan(temperature, duration) {
    const name = "TemporaryTemperature";
    const sname = toSnakeCase(name);
    const now =(new Date(Date.now())).toISOString();

    return (dispatch, getState) => {
        dispatch({type: "POST_" + sname + "_STARTED", payload: {temperature, duration}});
        return timeout(500)
            .then(() => {
                dispatch({type: "POST_" + sname + "_COMPLETED", payload: {temperature, duration, now}});
                return {temperature, duration, now};
            });
    }
}