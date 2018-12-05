


function build_3_axis(data) {    
        //let input_dataX = data.xValue;
        //let input_dataY = data.yValue;
        //let input_dataZ = data.zValue;
        
        //https://plot.ly/javascript/bubble-charts/
        let bubba_trace = {
            type:"bubble",
            text: input_dataX,
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
               title: 'Bubbble Chart Fun',
               xaxis: { title: "Some sort of Title Variable?" }
            };                             
        
    
         Plotly.newPlot("mybubble", data2, bubba_layout);
      
      
    
    
  };


