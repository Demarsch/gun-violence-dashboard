widgetRegistry = {};

$('#addWidget').click(() => {
    $('#modal').modal();
});

function createWidget(widgetSettings) {
    let grid = $('.grid-stack').data('gridstack');
    let widget = $(`
    <div>
        <div class="grid-stack-item-content">
            <div class="widget-header">    
                <h2>New Widget</h2>
                <a class="st-widget-btn" title="Settings" href="#"><img src="static/img/gear.svg"></a>
                <a class="rm-widget-btn" title="Delete Widget" href="#"><img src="static/img/close.svg"></a>
            </div>
            <div class="widget-content"></div>
        </div>
    </div>`);
    widget.find('.rm-widget-btn').click(() => grid.removeWidget(widget));
    grid.addWidget(widget, null, null, 3, 3, true);
    let widgetContent = widget.find('.widget-content')[0];
    $.post('data', widgetSettings)
        .done(d => {
            console.log(d);
            widgetRegistry[widgetSettings.chartType.value].render(widgetContent, d);
            $(widgetContent).css('background-image', 'none');
        })
}