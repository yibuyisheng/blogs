$(loadDemos);

function loadDemos() {
    $('.demo').each(function () {
        loadHtml($(this).attr('name'), $(this));
    });

    function loadHtml(name, $con) {
        getHtml(name, function (html) {
            $con.html(html);
        });
    }

    function getHtml(name, loadFn) {
        $.get(CONFIG.demoDir + '/demos/' + name, function (html) {
            loadFn(
                html.replace(/url\(\.\.\/imgs\//g, 'url(../../imgs/')
                    .replace(/src="\.\.\/imgs\//g, 'src="../../imgs/')
            );
        });
    }
}
