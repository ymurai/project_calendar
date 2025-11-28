document.addEventListener('DOMContentLoaded', () => {
  const currentMonthYear = document.getElementById('current-month-year');
  const calendarGrid = document.getElementById('calendar-grid');
  const prevMonthBtn = document.getElementById('prev-month-btn');
  const nextMonthBtn = document.getElementById('next-month-btn');
  const eventModal = document.getElementById('event-modal');
  const modalTitle = document.getElementById('modal-title');
  const eventContentInput = document.getElementById('event-content-input');
  const saveEventBtn = document.getElementById('save-event-btn');
  const deleteEventBtn = document.getElementById('delete-event-btn');
  const closeBtn = document.querySelector('.close-btn');

  // Backend base URL
  const API_BASE = 'http://localhost:3000/api/v1';

  let currentDate = new Date();
  let selectedDate = null; // Date object
  // Map dateKey (YYYY-MM-DD) -> { id, event_date, content }
  let eventsByDate = new Map();

  const pad2 = (n) => n.toString().padStart(2, '0');
  const toDateKey = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

  async function fetchEventsForMonth(date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const start = `${year}-${pad2(month + 1)}-01`;
    const end = `${year}-${pad2(month + 1)}-${pad2(new Date(year, month + 1, 0).getDate())}`;
    const url = `${API_BASE}/events?start_date=${start}&end_date=${end}`;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`GET failed: ${res.status}`);
      const list = await res.json();
      eventsByDate.clear();
      list.forEach((ev) => {
        eventsByDate.set(ev.event_date, ev);
      });
    } catch (e) {
      console.error('Error fetching events:', e);
    }
  }

  function renderCalendar() {
    calendarGrid.innerHTML = '';
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    currentMonthYear.textContent = `${year}年 ${month + 1}月`;

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Empty cells for alignment
    for (let i = 0; i < firstDayOfMonth; i++) {
      const emptyCell = document.createElement('div');
      calendarGrid.appendChild(emptyCell);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const cell = document.createElement('div');
      cell.classList.add('calendar-day');
      cell.textContent = day;

      const key = `${year}-${pad2(month + 1)}-${pad2(day)}`;
      const ev = eventsByDate.get(key);
      if (ev) {
        cell.classList.add('event-day');
        cell.title = ev.content;
      }

      // Today highlight
      const today = new Date();
      if (
        today.getFullYear() === year &&
        today.getMonth() === month &&
        today.getDate() === day
      ) {
        cell.classList.add('today');
      }

      cell.addEventListener('click', () => {
        selectedDate = new Date(year, month, day);
        modalTitle.textContent = `${year}年 ${month + 1}月 ${day}日`;
        eventContentInput.value = ev ? ev.content : '';
        eventModal.classList.add('show-modal');
      });

      calendarGrid.appendChild(cell);
    }
  }

  async function saveEvent() {
    if (!selectedDate) return;
    const content = eventContentInput.value.trim();
    const dateKey = toDateKey(selectedDate);
    const existing = eventsByDate.get(dateKey);

    try {
      if (content.length === 0) {
        // Empty content -> delete if exists
        if (existing) {
          const res = await fetch(`${API_BASE}/events/${existing.id}`, { method: 'DELETE' });
          if (!res.ok && res.status !== 404) throw new Error(`DELETE failed: ${res.status}`);
          eventsByDate.delete(dateKey);
        }
      } else if (existing) {
        // Update existing
        const res = await fetch(`${API_BASE}/events/${existing.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content }),
        });
        if (!res.ok) throw new Error(`PUT failed: ${res.status}`);
        const updated = await res.json();
        eventsByDate.set(dateKey, updated);
      } else {
        // Create new
        const res = await fetch(`${API_BASE}/events`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ event_date: dateKey, content }),
        });
        if (!res.ok) {
          // If duplicate date somehow -> fetch by date and update
          if (res.status === 409) {
            const byDate = await fetch(`${API_BASE}/events/by-date/${dateKey}`);
            if (byDate.ok) {
              const ev = await byDate.json();
              const put = await fetch(`${API_BASE}/events/${ev.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content }),
              });
              if (!put.ok) throw new Error(`PUT after 409 failed: ${put.status}`);
              const updated = await put.json();
              eventsByDate.set(dateKey, updated);
            } else {
              throw new Error(`409 then GET by-date failed: ${byDate.status}`);
            }
          } else {
            throw new Error(`POST failed: ${res.status}`);
          }
        } else {
          const created = await res.json();
          eventsByDate.set(dateKey, created);
        }
      }
    } catch (e) {
      console.error('Error saving/deleting event:', e);
      alert('保存に失敗しました。時間をおいて再度お試しください。');
    } finally {
      eventModal.classList.remove('show-modal');
      await fetchEventsForMonth(currentDate);
      renderCalendar();
    }
  }

  async function deleteEvent() {
    if (!selectedDate) return;
    const dateKey = toDateKey(selectedDate);
    const existing = eventsByDate.get(dateKey);
    if (!existing) {
      eventModal.classList.remove('show-modal');
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/events/${existing.id}`, { method: 'DELETE' });
      if (!res.ok && res.status !== 404) throw new Error(`DELETE failed: ${res.status}`);
      eventsByDate.delete(dateKey);
    } catch (e) {
      console.error('Error deleting event:', e);
      alert('削除に失敗しました。');
    } finally {
      eventModal.classList.remove('show-modal');
      await fetchEventsForMonth(currentDate);
      renderCalendar();
    }
  }

  // Event listeners
  closeBtn.addEventListener('click', () => eventModal.classList.remove('show-modal'));
  window.addEventListener('click', (e) => { if (e.target === eventModal) eventModal.classList.remove('show-modal'); });
  saveEventBtn.addEventListener('click', saveEvent);
  deleteEventBtn.addEventListener('click', deleteEvent);

  prevMonthBtn.addEventListener('click', async () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    await fetchEventsForMonth(currentDate);
    renderCalendar();
  });

  nextMonthBtn.addEventListener('click', async () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    await fetchEventsForMonth(currentDate);
    renderCalendar();
  });

  // Initial load
  (async () => {
    await fetchEventsForMonth(currentDate);
    renderCalendar();
  })();
});
