$(document).ready(function () {

  setTimeout(function () {
    updateDateNumbers();

    $(".fc-prev-button, .fc-next-button, .fc-today-button ").click(function () {
      updateDateNumbers();
    });

    $('#closeButton').click(function () {
      $("#calendarLeftSide").removeClass('col-12 col-sm-3').css("display", "none");
      $("#calendarRightSide").removeClass('col-sm-9 ps-0');
      $('button.fc-prev-button').click();
      $('button.fc-next-button').click();
      updateDateNumbers();
    });

    $('.calendar-footer ul li a').click(function () {
      $("#calendarLeftSide").addClass('col-12 col-sm-3').css("display", "block");
      $("#calendarRightSide").addClass('col-sm-9 ps-0')

      $('#closeButton').unbind().bind().click(function () {
        $("#calendarLeftSide").removeClass('col-12 col-sm-3').css("display", "none");
        $("#calendarRightSide").removeClass('col-sm-9 ps-0');
        updateDateNumbers();
      });

      // updateDateNumbers();

      // $('button.fc-prev-button').click();
      // $('button.fc-next-button').click()
    });

  }, 200);
});

function updateDateNumbers() {
  for (let i = 0; i < $(".fc-col-header-cell").length; i++) {
    $(".fc-col-header-cell-cushion").html(function () {
      let text = $(this).text().trim().split(" ");
      let first = text.shift();
      return (text.length > 0 ? "<span class='date-styled'>" + first + "</span> " : first) + text.join(" ");
    });
  }
}
