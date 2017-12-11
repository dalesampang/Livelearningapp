$(document).ready(function () {
    $('.noty').on('click', function(){
        $('.top-notify-wrapper').toggleClass('active');
    });
    /*** nice select js ***/
    $("#lang-select").niceSelect();

    /** story ctrl js **/
    $('.open-ctrl').on('click',function(){
        $('.story-opt-list').addClass('active').fadeIn(500);
        $(this).css('display', 'none');
        $('.close-ctrl').css('display', 'inline-block');
    });
    $('.close-ctrl').on('click',function(){
        $('.story-opt-list').removeClass('active');
        $(this).css('display', 'none');
        $('.open-ctrl').css('display', 'inline-block');
    });

    // teacher available ctrl js
    $('.available-ctrl').on('click', function(){
        $('.teacher-list').toggleClass('expand');
    });

    // list view js
    $('.list-icon').on('click', function(){
        $(this).css('display', 'none');
        $('.course-schd').addClass('close');
        $('.course-date-time-list').fadeIn();
        $('.table-icon').css('display', 'inline-block');
    });
    $('.table-icon').on('click', function(){
        $(this).css('display', 'none');
        $('.course-date-time-list').fadeOut();
        $('.course-schd').removeClass('close');
        $('.list-icon').css('display', 'inline-block');
    });

    $('#radioBtn a').on('click', function(){
    var sel = $(this).data('title');
    var tog = $(this).data('toggle');
    $('#'+tog).prop('value', sel);
    
    $('a[data-toggle="'+tog+'"]').not('[data-title="'+sel+'"]').removeClass('active').addClass('notActive');
    $('a[data-toggle="'+tog+'"][data-title="'+sel+'"]').removeClass('notActive').addClass('active');
    });
    
    $(".list-slider").owlCarousel({
        loop: true,
        items: 5,
        autoplay: false,
        margin: 5,
        dots: false,
        nav: true,
        navText: ["<i class='fa fa-chevron-left'></i>", "<i class='fa fa-chevron-right'></i>"]
    });
    $(".dashboard-schools-slider").owlCarousel({
        loop: true,
        items: 3,
        autoplay: false,
        margin: 10,
        dots: false,
        nav: true,
        navText: ["<i class='fa fa-chevron-left'></i>", "<i class='fa fa-chevron-right'></i>"]
    });
    $(".tutor-card-slider").owlCarousel({
        loop: true,
        items: 4,
        autoplay: false,
        margin: 30,
        dots: false,
        nav: true,
        navText: ["<i class='fa fa-chevron-left'></i>", "<i class='fa fa-chevron-right'></i>"]
    });
    $(".dashboard-onlineschools-slider").owlCarousel({
        loop: true,
        items: 4,
        autoplay: false,
        margin: 10,
        dots: false,
        nav: true,
        navText: ["<i class='fa fa-chevron-left'></i>", "<i class='fa fa-chevron-right'></i>"]
    });

    /** vertical slider **/
    $(".classpage-schd-slider, .material-slider").slick({
        vertical: true,
        slidesToShow: 3,
        slidesToScroll: 1,
        arrows: true,
        prevArrow: "<button type='button' class='slick-prev'><i class='fa fa-chevron-up'></i></button>",
        nextArrow: "<button type='button' class='slick-next'><i class='fa fa-chevron-down'></i></button>"
    });
    /*** file upload js **/
    var inputs = document.querySelectorAll('.inputfile');
    Array.prototype.forEach.call(inputs, function (input) {
        var label = input.nextElementSibling,
            labelVal = label.innerHTML;

        input.addEventListener('change', function (e) {
            var fileName = '';
            if (this.files && this.files.length > 1)
                fileName = (this.getAttribute('data-multiple-caption') || '').replace('{count}', this.files.length);
            else
                fileName = e.target.value.split('\\').pop();

            if (fileName)
                label.querySelector('span').innerHTML = fileName;
            else
                label.innerHTML = labelVal;
        });
    });

    function bs_input_file() {
        $(".input-file").before(
            function () {
                if (!$(this).prev().hasClass('input-ghost')) {
                    var element = $("<input type='file' class='input-ghost' style='visibility:hidden; height:0'>");
                    element.attr("name", $(this).attr("name"));
                    element.change(function () {
                        element.next(element).find('input').val((element.val()).split('\\').pop());
                    });
                    $(this).find("button.btn-choose").click(function () {
                        element.click();
                    });
                    $(this).find("button.btn-reset").click(function () {
                        element.val(null);
                        $(this).parents(".input-file").find('input').val('');
                    });
                    $(this).find('input').css("cursor", "pointer");
                    $(this).find('input').mousedown(function () {
                        $(this).parents('.input-file').prev().click();
                        return false;
                    });
                    return element;
                }
            }
        );
    }
    $(function () {
        bs_input_file();
    });


    $(".inditetu-course-tab-menu li").on("click", function(){
        $(".inditetu-course-tab-menu li").removeClass("active");
        $(this).addClass("active");
    });

    $('.round-btn').on('click', function(){
        $('.course-dropdown ul').toggleClass('active');
    });
});
