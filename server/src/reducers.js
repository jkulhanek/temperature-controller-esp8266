import { combineReducers } from 'redux';
import { toSnakeCase } from 'utils';

function resourceReducer(name) {
    const sname = toSnakeCase(name);
    return (state, action) => {
        if (typeof state === 'undefined') {
            state = {
                loading: false,
                resource: null,
            };
        }

        switch(action.type) {
            case "FETCH_" + sname + "_STARTED":
                state = Object.assign({}, state, {
                    loading: true,
                });
                break;
            case "FETCH_" + sname + "_FAILED":
                state = Object.assign({}, state, {
                    loading: false,
                    resource: null,
                });
                break;
            case "FETCH_" + sname + "_COMPLETED":
                state = Object.assign({}, state, {
                    loading: false,
                    resource: action.payload,
                });
                break;
            default:
                break;
        }

        return state;
    }
}

function putTemporaryTemperature(state, action) {
    if (typeof state === 'undefined') {
        state = {
            loading: false,
            resource: null,
        };
    }

    switch(action.type) {
        case "POST_TEMPORARY_TEMPERATURE_STARTED":
            state = Object.assign({}, state, {
                loading: true,
            });
            break;
        case "POST_TEMPORARY_TEMPERATURE_COMPLETED":
            state = Object.assign({}, state, {
                loading: false,
                resource: action.payload,
            });
            break;
        case "POST_TEMPORARY_TEMPERATURE_FAILED":
            state = Object.assign({}, state, {
                loading: false,
            });
            break;
    }

    return state;
}

const temporaryTemperatureRepository = resourceReducer("TemporaryTemperature");
const currentTemperature = resourceReducer("CurrentTemperature");

export default function rootReducer(state, action) {
    if (typeof state === 'undefined') {
        state = {
            temperature: 18.0,
        }
    }

    return Object.assign({}, state, {
        temporaryTemperature: putTemporaryTemperature(temporaryTemperatureRepository(state.temporaryTemperature, action), action),
        currentTemperature: currentTemperature(state.currentTemperature, action),
    });
}