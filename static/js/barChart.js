let bar_Chart = {
    name: 'bar',
    display: 'Bar Chart',
    render: function (canvas,data) {
        Plotly.purge(canvas);
        let xValue = [];
        let yValue =[];
        for (let item in data.data) {
            yValue.push(data.data[item].y_axis);
            xValue.push(item); 
        }   
        let trace1 = {
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

        let data2 = [ trace1 ];

        let layout = {
            margin: {
                    t: 10,
                    r: 10,
                    b: 25,
                    l: 0
                    }    
        };

        Plotly.newPlot(canvas, data2, layout, {responsive: true});
    }
};
widgetRegistry[bar_Chart.name] = bar_Chart;