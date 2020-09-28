import React from "react";
import ChartistGraph from "react-chartist";
import Legend from "chartist-plugin-legend";
import "./Chartist.scss";

export default function TemperaturePlan(props) {
    let data = {
        labels: [],
        series: [
            {'name': 'sunday', data:[]},
            {'name': 'monday', data:[]},
            {'name': 'tuesday', data:[]},
            {'name': 'wednesday', data:[]},
            {'name': 'thursday', data:[]},
            {'name': 'friday', data:[]},
            {'name': 'saturday', data:[]}
        ]
    }

    for(var i = 0; i < 2 * 24;++i) {
        //data.labels.push(i);
        if(props.temperatures) {
            for(var j = 0; j < 7; ++j) {
                data.series[j].data[i] = props.temperatures[j * 2 * 24 + i];
            }
        }

        // data.labels.push(Math.floor(i / 2) + ':' + ((i % 2) ? '30' : '00'));
    }

    let plugins = []; // [Legend({position: 'bottom'})];

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
                },
                plugins}}
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
