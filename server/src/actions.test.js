import { fetchTemporaryTemperature } from 'actions';
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import fetchMock from 'fetch-mock';

const mockStore = configureMockStore([ thunk ]);

describe('async actions', () => {
    afterEach(() => {
        fetchMock.restore()
    });

    it('calls request and success actions if the fetch response was successful', () => {
        const store = mockStore({});
        const data = {temperature:18.2, start: 1567006067405, duration: 3600*1000 };
        fetchMock.getOnce('/temporaryTemperature', {
            body: { temporaryTemperature: data },
            headers: { 'content-type': 'application/json' }
        });

        return store.dispatch(fetchTemporaryTemperature())
        .then(() => {
            const expectedActions = store.getActions();
            expect(expectedActions.length).toBe(2);
            expect(expectedActions).toContainEqual({type: "FETCH_TEMPORARY_TEMPERATURE_STARTED"});
            expect(expectedActions).toContainEqual({type: "FETCH_TEMPORARY_TEMPERATURE_COMPLETED", payload: data });
        })
    });
});