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
        return fetch("/temporaryTemperature")
            .then(handleError)
            .then(response => response.json())
            .then(json => {
                dispatch(fetchCompleted(json));
                return json;
            })
            .catch(error => dispatch(fetchFailed(error)));
        }
}