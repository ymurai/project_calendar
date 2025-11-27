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

    const BASE_URL = 'http://localhost:3000/api';

    let currentDate = new Date();
    let selectedDate = null;
    let events = {}; // Store events in an object

    async function fetchEvents() {
        try {
            const response = await fetch(`${BASE_URL}/events`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            events = {}; // Clear existing events
            data.forEach(event => {
                const startDate = new Date(event.start);
                const dateKey = `${startDate.getFullYear()}-${startDate.getMonth() + 1}-${startDate.getDate()}`;
                events[dateKey] = event.title; // Store title for now
            });
            renderCalendar();
        } catch (error) {
            console.error('Error fetching events:', error);
        }
    }

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
                eventModal.classList.add('show-modal');
            });
            calendarGrid.appendChild(dayCell);
        }
    }

    closeBtn.addEventListener('click', () => {
        eventModal.classList.remove('show-modal');
    });

    saveEventBtn.addEventListener('click', async () => {
        const eventContent = eventContentInput.value;
        const year = selectedDate.getFullYear();
        const month = selectedDate.getMonth();
        const day = selectedDate.getDate();
        const dateString = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

        if (eventContent) {
            try {
                const response = await fetch(`${BASE_URL}/events`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        title: eventContent,
                        start: `${dateString}T00:00:00Z`,
                        end: `${dateString}T23:59:59Z`
                    })
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                await fetchEvents(); // Re-fetch events after saving
            } catch (error) {
                console.error('Error saving event:', error);
            }
        }
        eventModal.classList.remove('show-modal');
    });

    window.addEventListener('click', (e) => {
        if (e.target == eventModal) {
            eventModal.classList.remove('show-modal');
        }
    });

    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        fetchEvents(); // Fetch events for new month
    });

    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        fetchEvents(); // Fetch events for new month
    });

    fetchEvents(); // Initial fetch of events
