let widget = {
    name: 'Rectangle',
    render: function(canvas, data) {
        //Just rendering a blue rectangle
        //You can render chart here
        canvas.innerHtml = '<div style="width:100px;height:50px;background-color:blue"></div>';
    }
};

widgetRegistry.push(widget);