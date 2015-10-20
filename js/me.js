var pSwipe = function() {
    var $pswp = $('.pswp')[0];
    var image = [];

    $('.ps-gallery').each(function () {
        var $pic = $(this);
        var items = [];
        $pic.find('a.thumbnail').each(function () {
            var $href = $(this).attr('href'),
                $width = $(this).data('width'),
                $height = $(this).data('height'),
                $title = $(this).siblings('figcaption').html();


            var item = {
                src: $href,
                w: $width,
                h: $height,
                title: $title
            };


            items.push(item);
        });

        $.each(items, function (index, value) {
            image[index] = new Image();
            image[index].src = value['src'];
        });

        $pic.on('click', 'figure', function (event) {
            event.preventDefault();

            var $index = $(this).index();
            var options = {
                index: $index,
                bgOpacity: 0.7,
                showHideOpacity: true,
                history: false
            };

            var lightBox = new PhotoSwipe($pswp, PhotoSwipeUI_Default, items, options);
            lightBox.init();
        });
    });
};
