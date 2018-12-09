const sizeRange = [6, 50];

let bubbleChartWidget = {    
    name: 'bubble',
    display: 'Bubble Chart',
    render: function(canvas,data){
        Plotly.purge(canvas);
        let labels = []
        let x = [];
        let y = [];
        let z = [];
        let hoverText = [];
        for (let label in data.data) {
          labels.push(label);
          let values = data.data[label];
          y.push(values.y_axis);
          x.push(values.x_axis);
          let text = `${data.pivot[0]}: ${label}<br>${data.x_axis}: ${values.x_axis}<br>${data.y_axis}: ${values.y_axis}`;
          if (values.hasOwnProperty('z_axis')) {
            z.push(values.z_axis);
            text += `<br>${data.z_axis}: ${values.z_axis}`;
          } else {
            z.push(6)
          }
          hoverText.push(text);
        }
        let scale = d3.scaleLinear()
          .domain(d3.extent(z))
          .range(sizeRange);

        let trace = {
          x: x,
          y: y,
          text: labels,
          mode: 'markers',
          type: 'scatter',
          marker: {
            size: z.map(scale),
            colorscale: 'RdOrYl',
            color: z.map(scale),
            opacity: 0.8
          },
          text: hoverText,
          hovertext: hoverText,
          hoverinfo: 'text'
        };
        let layout = {
          margin: {
            t: 20,
            r: 10,
            b: 50,
            l: 50
          }, 
          xaxis: {
            title: data.x_axis,
            titlefont: {
              size: 14
            }
          },  
          yaxis: {
            title: data.y_axis,
            titlefont: {
              size: 14
            }
          }
        };
        Plotly.react(canvas, [trace], layout, { responsive: true });      
      }    
};
widgetRegistry[bubbleChartWidget.name] = bubbleChartWidget;

