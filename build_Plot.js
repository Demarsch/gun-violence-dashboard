function buildMetadata(sample) {

    // Use d3 to select the panel with id of `#sample-metadata`
    // json the results from  @app .route("/metadata/<sample>")
    //15/2/4 Activity 4 day 2
  d3.json(`/metadata/${sample}`).then(function(data) {
    let sample_panel = d3.select("#sample-metadata");
      

    // Use `.html("") to clear any existing metadata
    sample_panel.html("");

    // Use `Object.entries` to add each key and value pair to the panel
    // Hint: Inside the loop, you will need to use d3 to append new
    // tags for each key-value in the metadata.
    Object.entries(data).forEach(([key, value]) => {
    sample_panel.append("h6").text(`${key}: ${value}`);
    });
    // BONUS: Build the Gauge Chart
    // buildGauge(data.WFREQ);
});
}
function buildCharts(sample) {

  // @TODO: Use `d3.json` to fetch the sample data for the plots
    //C:\Users\Craig\gitlab\UCIRV201807DATA4-Class-Repository-DATA\01-Lesson-Plans\15-Interactive-Visualizations-and-Dashboards\2\Activities\04-Stu_Stocks\Solved
      d3.json(`/samples/${sample}`).then(function(data) {
        let input_data1 = data.otu_ids;
        let sample_values = data.sample_values;
        let otu_labels = data.otu_labels;
        
        //https://plot.ly/javascript/bubble-charts/
        let bubba_trace = {
            type:"bubble",
            text: otu_labels,
            x: otu_ids,
            y: sample_values,
            mode:'markers',
            marker: {
                size: sample_values,
                }
            };
        
            
        let data2 =[bubba_trace];
            
        let bubba_layout = {
               title: 'EWW',
               xaxis: { title: "OTU ID" }
            };                             
        
    
  
    // @TODO: Build a Bubble Chart using the sample data
      Plotly.newPlot("mybubble", data2, bubba_layout);
      
      
      
      
    // @TODO: Build a Pie Chart
     
          
          
          
          
          
          
          
          //https://plot.ly/javascript/pie-charts/
           
      
        var data3 = [{
          values: sample_values.slice(0, 10),
          labels: otu_ids.slice(0, 10),
          hovertext: otu_labels.slice(0, 10),
          hoverinfo: "hovertext",
          type: "pie"
         
          
        }];
        var layout = {
          title: 'Things That Make it Gross',
          height: 400,
          width: 600,
               
        };

        Plotly.newPlot("my_pie", data3, layout)
  });

}

function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
    //Grab name from @app.route ("/names")
  d3.json("/names").then((sampleNames) => {
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    const firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildCharts(newSample);
  buildMetadata(newSample);
}

// Initialize the dashboard
init();
