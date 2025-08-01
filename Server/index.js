
const express = require('express');
const app = express();
const version = 'v1';
const port = 3000;
const { db, getAllEvents, addEvent, getEventById, getEventByDate, updateEvent, deleteEvent } = require('./database/db');

app.use(express.json());

app.get(`/api/${version}/events`, (req, res) => {
  getAllEvents((err, rows) => {
    if (err) {
      res.status(500).send(err.message);
      return;
    }
    res.json(rows);
  });
});

app.post(`/api/${version}/events`, (req, res) => {
  const { event_date, content } = req.body;
  addEvent(event_date, content, (err, result) => {
    if (err) {
      res.status(500).send(err.message);
      return;
    }
    res.status(201).json(result);
  });
});

app.get(`/api/${version}/events/:id`, (req, res) => {
  const { id } = req.params;
  getEventById(id, (err, row) => {
    if (err) {
      res.status(500).send(err.message);
      return;
    }
    if (!row) {
      res.status(404).json({
        error: {
          code: "NOT_FOUND",
          message: `Event with ID ${id} not found.`
        }
      });
      return;
    }
    res.json(row);
  });
});

app.get(`/api/${version}/events/by-date/:date`, (req, res) => {
  const { date } = req.params;
  getEventByDate(date, (err, row) => {
    if (err) {
      res.status(500).send(err.message);
      return;
    }
    if (!row) {
      res.status(404).json({
        error: {
          code: "NOT_FOUND",
          message: `Event for date ${date} not found.`
        }
      });
      return;
    }
    res.json(row);
  });
});

app.put(`/api/${version}/events/:id`, (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  updateEvent(id, content, (err, row) => {
    if (err) {
      res.status(500).send(err.message);
      return;
    }
    if (!row) {
      res.status(404).json({
        error: {
          code: "NOT_FOUND",
          message: `Event with ID ${id} not found.`
        }
      });
      return;
    }
    res.json(row);
  });
});

app.delete(`/api/${version}/events/:id`, (req, res) => {
  const { id } = req.params;
  deleteEvent(id, (err, result) => {
    if (err) {
      res.status(500).send(err.message);
      return;
    }
    if (result.changes === 0) {
      res.status(404).json({
        error: {
          code: "NOT_FOUND",
          message: `Event with ID ${id} not found.`
        }
      });
      return;
    }
    res.status(204).send();
  });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
