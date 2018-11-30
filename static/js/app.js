widgetRegistry = [];

$('#addWidget').click(() => {
    $('#modal').modal();
});

function createWidget(x, y, width, height, title) {
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
}

createWidget(0, 0, 7, 5, 'Cool Map');
createWidget(8, 0, 5, 5, 'Cool Pie Chart');
createWidget(0, 5, 4, 4, 'Chart #1');
createWidget(4, 5, 4, 4, 'Chart #2');
createWidget(8, 5, 4, 4, 'Chart #3');