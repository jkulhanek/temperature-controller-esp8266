import reducer from 'reducers';

describe('reducers', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual({
        temperature: 18.0,
        temporaryTemperature: {
            loading: false,
            resource: null,
        }
    });
  })

  it('should handle TEMPORARY_TEMPERATURE', () => {
    expect(
      reducer(undefined, {
        type: "FETCH_TEMPORARY_TEMPERATURE_STARTED",
      })
    ).toEqual({
        temperature: 18.0,
        temporaryTemperature: {
            loading: true,
            resource: null,
        }
    })

    expect(
        reducer(undefined, {
            type: "FETCH_TEMPORARY_TEMPERATURE_COMPLETED",
            payload: {
                temperature: 12,
                start: 3,
                duration: 5,
            }
        })
      ).toEqual({
          temperature: 18.0,
          temporaryTemperature: {
              loading: false,
              resource: {
                temperature: 12,
                start: 3,
                duration: 5,
            },
        }
    })
  })
})