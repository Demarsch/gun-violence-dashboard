let categories = fetch('categories').then(r => r.json());

$('#addWidgetBtn').click(() => {
    let modal = $('#addWidgetModal');
    //Allow only one option per group to be selected
    modal.find('div[data-group] button')
        .click(e => {
            let self = $(e.target);
            let isActive = self.hasClass('active');
            let dataGroup = self.parents('div[data-group]').attr('data-group');
            self.parents(`.modal-body`).find(`div[data-group="${dataGroup}"] button`).toggleClass('active', false);
            self.toggleClass('active', !isActive);
        });
    //Load categories if not loaded yet
    categories.then(d => {
        let ddMenus = $('#addWidgetModal .dropdown-menu');
        ddMenus.each((_, el) => {
            let ddMenu = $(el);
            ddMenu.empty();
            d.sort();
            $.each(d, (_, category) => {
                ddMenu.append($(`<button class="btn-lightbg dropdown-item" href="#">${category}</a>`)
                    .click(e => {
                        $(e.target).toggleClass('active');
                        let activeCategories = ddMenu.find('.dropdown-item.active').map((_, e) => $(e).text()).get();
                        let ddButton = ddMenu.prev('button');
                        if (activeCategories.length == 0) {
                            ddButton.text('- Select Categories -');
                        } else if (activeCategories.length == 1) {
                            ddButton.text(activeCategories[0]);
                        } else {
                            ddButton.text(`${activeCategories.length} Categories Selected`);
                        }
                    }));
            })
        });
        ddMenus.click(e => e.stopPropagation());
    });
    modal.modal();
});