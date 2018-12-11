let widget = {
    name: 'pie',
    display: 'Pie Chart',
    render: function(canvas, data) {
        Plotly.purge(canvas);
        $(canvas).find('.na').remove();
        // Only single level is supported
        if (data.pivot.length == 1) {
            let values = [];
            let labels = [];
            for (let item in data.data) {
                values.push(data.data[item].y_axis);
                labels.push(item); 
            } 
            let trace = {
                values: values,
                labels: labels,
                type: 'pie',
                titlefont: {
                    size: 18
                },
                hoverinfo: 'label+value',
                textinfo: 'percent'
            };
            let layout = { 
                margin: {
                t: 10,
                r: 10,
                b: 10,
                l: 0
                }    
            };
            Plotly.react(canvas, [trace], layout, { responsive: true });
        } 
        //Multilevels are not supported
        else {
            $(canvas).append('<div class="na" title="Can\'t build a pie chart from a multi pivoted data"></div>');
        }
    }
};

widgetRegistry[widget.name] = widget;