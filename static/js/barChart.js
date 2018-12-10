let bar_Chart = {
    name: 'bar',
    display: 'Bar Chart',
    render: function (canvas,data) {
        Plotly.purge(canvas);
        let traceData = null;
        let layout = null;
        // Single bar mode
        if (data.pivot.length == 1) {
            let xValue = [];
            let yValue = [];
            for (let item in data.data) {
                yValue.push(data.data[item].y_axis);
                xValue.push(item); 
            }   
            let trace = {
                type: 'bar',
                x: xValue,
                y: yValue,   
                marker: {
                    color: '#BB2222',
                    line: {
                        width: 2.5
                    }
                }
            };
            traceData = [ trace ];
            layout = {
                margin: {
                        t: 10,
                        r: 10,
                        b: 25,
                        l: 0
                        }    
            };
        }
        //Grouped bar
        else {
            let xValue = [];
            let traces = {};
            let l2Labels = new Set();
            //First we need to extract all level 2 labels - in case some level 1 items don't have them (e.g. no data for 2013 for Arisona)
            for (let l1Label in data.data) {
                for (let levelTwoLabel in data.data[l1Label]) {
                    l2Labels.add(levelTwoLabel);
                }
            }
            l2Labels = new Array(...l2Labels).sort();
            for (let l1Label in data.data) {
                xValue.push(l1Label); 
                let l1Data = data.data[l1Label];
                for (let l2Label of l2Labels) {
                    let dataItem = l1Data[l2Label];
                    let trace = traces[l2Label]
                    if (!trace) {
                        trace = {
                            type: 'bar',
                            name: l2Label,
                            y: [],
                            x: xValue
                        }
                        traces[l2Label] = trace;
                    }
                    trace.y.push(dataItem ? dataItem.y_axis : 0);
                }
            }  
            traceData = Object.values(traces);
            layout = {
                barmode: 'group',
                margin: {
                        t: 10,
                        r: 10,
                        b: 25,
                        l: 0
                        }    
            };
        }

        Plotly.newPlot(canvas, traceData, layout, {responsive: true});
    }
};
widgetRegistry[bar_Chart.name] = bar_Chart;