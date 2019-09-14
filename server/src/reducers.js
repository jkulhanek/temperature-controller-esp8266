import { combineReducers } from 'redux';
import { toSnakeCase } from 'utils';
import {reducer as notifications} from 'react-notification-system-redux';


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

function writeableResourceReducer(name) {
    const baseReducer = resourceReducer(name);
    const sname = toSnakeCase(name);
    return (state, action) => {
        state = baseReducer(state, action);
        switch(action.type) {
            case "POST_" + sname + "_STARTED":
                state = Object.assign({}, state, {
                    loading: true,
                    resource: action.payload,
                    oldResource: state.resource,
                });
                break;
            case "POST_" + sname + "_FAILED":
                state = Object.assign({}, state, {
                    loading: false,
                    resource: state.oldResource || null,
                });
                break;
            case "POST_" + sname + "_COMPLETED":
                state = Object.assign({}, state, {
                    loading: false,
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
        throw "no state";
    }

    switch(action.type) {
        case "POST_TEMPORARY_TEMPERATURE_STARTED":
            break;
        case "POST_TEMPORARY_TEMPERATURE_COMPLETED":
            state = Object.assign({}, state, {
                temporaryTemperature: Object.assign({}, state.temporaryTemperature, {
                    loading: false,
                    resource: action.payload,
                }),
                currentTemperature: Object.assign({}, state.currentTemperature, {
                    resource: Object.assign({}, state.currentTemperature.resource, {
                        userTemperature: action.payload.temperature,
                    })
                })
            })
             Object.assign({}, state, {
                loading: false,
                resource: action.payload,
            });
            break;
        case "POST_TEMPORARY_TEMPERATURE_FAILED":
            break;
    }

    return state;
}

const temporaryTemperatureRepository = resourceReducer("TemporaryTemperature");
const currentTemperature = resourceReducer("CurrentTemperature");
const stateRepository = writeableResourceReducer("State");
const currentPlanRepository = writeableResourceReducer("CurrentPlan");

export default function rootReducer(state, action) {
    if (typeof state === 'undefined') {
        state = {
            temperature: 18.0,
        }
    }

    return putTemporaryTemperature(Object.assign({}, state, {
        notifications: notifications(state.notifications, action),
        temporaryTemperature: temporaryTemperatureRepository(state.temporaryTemperature, action),
        currentTemperature: currentTemperature(state.currentTemperature, action),
        state: stateRepository(state.state, action),
        currentPlan: currentPlanRepository(state.currentPlan, action),
    }), action);
}