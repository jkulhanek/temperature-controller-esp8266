import React from "react";
import ChartistGraph from "react-chartist";

export default function TemperaturePlan(props) {
    let data = {
        labels: [],
        series: [[],[],[],[],[],[],[]]
    }

    for(var i = 0; i < 24;++i) {
        //data.labels.push(i);
        if(props.temperatures) {
            for(var j = 0; j < 7; ++j) {
                data.series[j][i] = props.temperatures[j * 24 + i];
            }
        }
    }

    return <div className="ct-chart">
        <ChartistGraph
            data={data}
            type="Line"
            options={{
                low: 0,
                high: 30,
                showArea: false,
                height: "245px",
                axisX: {
                  showGrid: false
                },
                lineSmooth: true,
                showLine: true,
                showPoint: true,
                fullWidth: true,
                chartPadding: {
                  right: 50
                }
              }}
            responsiveOptions={[
                [
                  "screen and (max-width: 640px)",
                  {
                    axisX: {
                      labelInterpolationFnc: function(value) {
                        return value[0];
                      }
                    }
                  }
                ]
              ]}
        />
    </div>
}