widgetRegistry = [];

$('#addWidget').click(() => {
    $('#modal').modal();
});

function createWidget(widgetSettings, x, y, width, height, title) {
    let widget = $(document.createElement('div'))
        .addClass('grid-stack-item')
        .attr('data-gs-x', x)
        .attr('data-gs-y', y)
        .attr('data-gs-width', width)
        .attr('data-gs-height', height)
        .html(`
        <div class="grid-stack-item-content">
            <div class="widget-header">    
                <h2>${title}</h2>
                <a class="st-widget-btn" title="Settings" href="#"><img src="static/img/gear.svg"></a>
                <a class="rm-widget-btn" title="Delete Widget" href="#"><img src="static/img/close.svg"></a>
            </div>
        </div>
        `);
    widget.find('.rm-widget-btn').click(() => widget.remove());
    $('.grid-stack').append(widget);
    console.log(widgetSettings ? widgetSettings : 'No widget settings provided for the widget');
}

createWidget(null, 0, 0, 7, 5, 'Cool Map');
createWidget(null, 8, 0, 5, 5, 'Cool Pie Chart');
createWidget(null, 0, 5, 4, 4, 'Chart #1');
createWidget(null, 4, 5, 4, 4, 'Chart #2');
createWidget(null, 8, 5, 4, 4, 'Chart #3');