$(loadDemos);

function loadDemos() {
    var exp = new RegExp(CONFIG.demoexpstr);
    if (exp.test(navigator.userAgent)) {
        $('.demo').each(function () {
            loadHtml($(this).attr('name'), $(this));
        });
    }
    else {
        $('.demo').each(function () {
            loadImg($(this).attr('name'), $(this));
        });
    }

    $('.demo').on('click', '.demo-img', function () {
        $.get(CONFIG.demoDir + '/demos/' + $(this).closest('.demo').attr('name'), function (data) {

        });
    });

    function loadImg(name, $con) {
        var tip = [
            '您的浏览器目前可能还不支持直接展示当前示例内容，已使用 phantomjs 将其自动转换成图片，点击图片可以查看实现当前内容效果的源码。',
            '由于 phantomjs 对于某些 CSS 新特性支持也不太好，因此建议切换到最新桌面版的 Chrome 浏览器访问本博客。'
        ].join('');
        $con.html([
            '<img class="demo-img" src="' + CONFIG.demoDir + '/demos/' + name + '.png" title="' + tip + '">',
            '<pre class="demo-code" style="display:none"><code></code></pre>',
            '<p style="font-size:12px;color:#666;"><strong>注：</strong>' + tip + '</p>'
        ].join(''));

        getHtml(name, function (html) {
            $con.find('.demo-code code').text(html);
        });

        $con.find('.demo-img').on('click', function () {
            $con.find('.demo-code').toggle();
        });
    }

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
