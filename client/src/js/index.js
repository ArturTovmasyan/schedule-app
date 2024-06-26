$(document).ready(function () {
  setTimeout(function () {
    updateDateNumbers();
    $(".fc-prev-button, .fc-next-button, .fc-today-button ").click(function () {
      updateDateNumbers();
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

document.querySelectorAll('.fc-timeline-lane-frame')?.forEach((e) => {
  if (e) {
    const cellHoverElementsContainer = document.createElement('div');
    cellHoverElementsContainer.className = 'cell-hover-elements-container';
    const count = currentView === 'resourceTimelineWeek' ? 7 : 24;
    for (let i = 0; i < count; i += 1) {
      cellHoverElementsContainer.appendChild(document.createElement('div'));
    }
    e?.appendChild(cellHoverElementsContainer);
  }
});
