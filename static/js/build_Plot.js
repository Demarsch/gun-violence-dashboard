let build_3_axis_bubble = {    
    name: 'bubble'
    display: 'Bubble Chart',
    render: function(canvas,data){
        Plotly.purge(canvas);
        input_dataX = []
        input_dataY = []
        input_dataZ = []
        for (let item in data.data) {
            values.push(data.data[item].y_axis);
            labels.push(item);
    }
    let bubba_trace = {
            type:"bubble",
            text: input_dataZ,
            x: input_dataX,
            y: input_dataY,
            mode:'markers',
            marker: {
          size: input_dataX,
          color: input_dataY,
          colorscale: "Reds"
        }
            };
        
            
        let data2 =[bubba_trace];
            
        let bubba_layout = {
                margin: {
                t: 10,
                r: 10,
                b: 10,
                l:0
                }
            };                             
        
    
         Plotly.newPlot("mybubble", data2, bubba_layout);
      
}
    
  };
widgetRegistry[build_3_axis_bubble.name] = build_3_axis_bubble;

