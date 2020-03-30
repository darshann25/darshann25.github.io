$(document).ready(function() {
    $('#slides').superslides({
        animation: 'fade',
        play: 5000,
        pagination: false
    });

    var typed = new Typed(".typed", {
        strings: ["Data Scientist.", "Machine Learning Engineer.", "Management Consultant.", "Student.","Coffee Mug Hoarder.","Nostalgic Movie Binger."],
        typeSpeed: 100,
        loop: true,
        startDelay: 1000,
        showCursor: false
    });
});