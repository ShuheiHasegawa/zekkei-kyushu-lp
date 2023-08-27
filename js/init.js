function menuClick(elmName) {
  window.location.hash = elmName;
  $(".sidenav-overlay").click();
}

(function ($) {
  $(function () {
    $(".sidenav").sidenav();
  }); // end of document ready
})(jQuery); // end of jQuery name space
