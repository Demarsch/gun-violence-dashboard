let mapWidget = {
    name: 'map',
    display: 'Map',
    render: function(canvas, input) {
        Plotly.purge(canvas);
        let values = [];
        let labels = [];
        for (let item in input.data) {
            values.push(input.data[item].y_axis);
            labels.push(item); 
        } 
	      let data = [{
	          type: 'choropleth',
	          locationmode: 'USA-states',
	          locations: labels,
	          z: values,
	          text: labels,
	          zmin: Math.min(...values),
	          zmax: Math.max(...values),
	          colorscale: [
	              [0, 'wheat'], [1, 'firebrick']
	          ],
	          colorbar: {
	              title: input.y_axis,
	              thickness: 10
	          },
	          marker: {
	              line:{
	                  color: 'rgb(255,255,255)',
	                  width: 2
	              }
	          }
	      }];


	      let layout = {
	      	margin: {
				    l: 10,
				    r: 10,
				    b: 10,
				    t: 10,
				    pad: 4
				  },
	          geo:{
	              scope: 'usa',
	              showlakes: true,
	              lakecolor: 'rgb(255,255,255)'
	         	  },	                          
	      };

	      Plotly.plot(canvas, data, layout, {responsive: true, fixedplot: true});
	}};

widgetRegistry[mapWidget.name] = mapWidget;