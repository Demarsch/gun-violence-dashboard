let Histogram_Chart = {
    name: 'Histogram',
    display: 'Histogram',
    render: function(canvas, data) {
        Plotly.purge(canvas);
        let values = [];
        let labels = [];
        for (let item in data.data) {
            values.push(data.data[item].y_axis);
            labels.push(item); 
        } 
        let trace = {
            values: values,
            labels: labels,
            type: 'histogram',
            titlefont: {
                size: 18
            },
            hoverinfo: 'label+value',
            textinfo: 'percent'
        };

        let data = [trace]

        let layout = {
            title: 'Histogram Chart',
            xaxis: {title: 'Victim Age', showline: true},
            yaxis: {title: 'Number of Incidents', showline: true},
            margin: {l: 0, t: 10, r: 10, b:25}
        
            
        };
        Plotly.react(canvas, [trace], layout, { responsive: true });
    }
};

widgetRegistry[widget.name] = histogram;

