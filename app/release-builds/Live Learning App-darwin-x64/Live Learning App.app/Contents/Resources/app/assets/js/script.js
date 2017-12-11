jQuery(document).ready(function($) {
    /** tutor slider **/
    $(".tutor-slider").owlCarousel({
        items: 3,
        loop: true,
        autoplay: 5000,
        nav: false,
        dots: false,
        stagePadding: 200
    });

    /** instructor slider **/
    $(".instructor-slider").owlCarousel({
        items: 1,
        autoplay: 5000,
        loop: true,
        nav: false,
        dots: true,
        margin: 60,
        stagePadding: 400
    });

    /** nice select js **/
    $(".header-search-form select").niceSelect();
    // switch 
    $("[name='my-checkbox']").bootstrapSwitch();
});