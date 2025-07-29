document.addEventListener('DOMContentLoaded', () => {
    const currentMonthYear = document.getElementById('current-month-year');
    const calendarGrid = document.getElementById('calendar-grid');
    const prevMonthBtn = document.getElementById('prev-month-btn');
    const nextMonthBtn = document.getElementById('next-month-btn');
    const eventModal = document.getElementById('event-modal');
    const modalTitle = document.getElementById('modal-title');
    const eventContentInput = document.getElementById('event-content-input');
    const saveEventBtn = document.getElementById('save-event-btn');
    const closeBtn = document.querySelector('.close-btn');

    let currentDate = new Date();
    let selectedDate = null;
    const events = {}; // Store events in an object

    function renderCalendar() {
        calendarGrid.innerHTML = '';
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        currentMonthYear.textContent = `${year}年 ${month + 1}月`;

        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        for (let i = 0; i < firstDayOfMonth; i++) {
            const emptyCell = document.createElement('div');
            calendarGrid.appendChild(emptyCell);
        }

        for (let i = 1; i <= daysInMonth; i++) {
            const dayCell = document.createElement('div');
            dayCell.classList.add('calendar-day');
            dayCell.textContent = i;

            const dateKey = `${year}-${month + 1}-${i}`;
            if (events[dateKey]) {
                dayCell.title = events[dateKey];
                dayCell.classList.add('event-day');
            }

            dayCell.addEventListener('click', () => {
                selectedDate = new Date(year, month, i);
                modalTitle.textContent = `${year}年 ${month + 1}月 ${i}日`;
                eventContentInput.value = events[dateKey] || '';
                eventModal.style.display = 'block';
            });
            calendarGrid.appendChild(dayCell);
        }
    }

    closeBtn.addEventListener('click', () => {
        eventModal.style.display = 'none';
    });

    saveEventBtn.addEventListener('click', () => {
        const eventContent = eventContentInput.value;
        const year = selectedDate.getFullYear();
        const month = selectedDate.getMonth();
        const day = selectedDate.getDate();
        const dateKey = `${year}-${month + 1}-${day}`;

        if (eventContent) {
            events[dateKey] = eventContent;
        } else {
            delete events[dateKey];
        }
        renderCalendar();
        eventModal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target == eventModal) {
            eventModal.style.display = 'none';
        }
    });

    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });

    renderCalendar();
});
