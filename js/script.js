$(document).ready(function() {

    $('#slides').superslides({
        animation: 'fade',
        play: 5000,
        pagination: false
    });

    var typed = new Typed(".typed", {
        strings: ["Data Scientist", "Machine Learning Engineer", "Management Consultant", "Student","Coffee Mug Hoarder","Nostalgic Movie Binger"],
        typeSpeed: 75,
        loop: true,
        startDelay: 1000,
        showCursor: false
    });
    
    $('#slides').ready(function() {
        
        setTimeout(function(){
            $('#loading').hide();
            $('#loading-image').hide();
        }, 2500);
    });

    $('.owl-carousel').owlCarousel({
        loop:true,
        items: 4,
        responsive:{
            0:{
                items:1
            },
            480:{
                items:2
            },
            768:{
                items:3
            },
            938:{
                items:4
            }

        }
    });

    var skillsTopOffset = $(".skillsSection").offset().top;
    var statsTopOffset = $(".statsSection").offset().top;
    var countUpFinished = false

    $(window).scroll(function() {

        if(window.pageYOffset > skillsTopOffset - $(window).height() + 200) {

            $('.chart').easyPieChart({
                easing: 'easeInOut',
                barColor: '#fff',
                trackColor: false,
                scaleColor: false,
                lineWidth: 4,
                size: 152,
                onStep: function(from, to, percent) {
                    $(this.el).find('.percent').text(Math.round(percent));
                }
            });

        }

        if(!countUpFinished && window.pageYOffset > statsTopOffset - $(window).height() + 50) {
            $(".counter").each(function() {
                var element = $(this);
                var endVal = parseInt(element.text());
        
                element.rCounter({
                    duration: 30
                });
            });
            countUpFinished = true;
        }        
    });

    $('#timelineSection').verticalTimeline({
        startLeft: true,
        alternate: true,
        animate: "slide",
        arrows: true
    });

    $("[data-fancybox]").fancybox();

    $(".items").isotope({
        filter: '*',
        animationOptions: {
            duration: 1500,
            easing: 'linear',
            queue: false
        }
    });

    $("#filters a").click(function() {

        $("#filters .current").removeClass("current");
        $(this).addClass("current");

        var selector = $(this).attr("data-filter");
        console.log(selector)
        console.log('.items')

        $(".items").isotope({
            filter: selector,
            animationOptions: {
                duration: 1500,
                easing: 'linear',
                queue: false
            }
        });

        return false;

    });

});