let bar_Chart = {
    name: 'bar'
    display: 'Bar Chart',
    render function (canvas,data) {
        Plotly.purge(canvas);
        let xValue = [];
        let yValue =[];
        or (let item in data.data) {
            values.push(data.data[item].y_axis);
            labels.push(item); 
        }   
        let trace1 = {
            type: 'bar',
            x: xValue,
            y: yValue,   
            marker: {
                color: '#C8A2C8',
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
                    b: 10,
                    l: 0
                    }    
        };

        Plotly.newPlot('myDiv', data2, layout, {responsive: true});
    }
};