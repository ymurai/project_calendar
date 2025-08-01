
const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const app = express();
const version = 'v1';
const port = 3000;
const { getAllEvents, addEvent, getEventById, getEventByDate, updateEvent, deleteEvent } = require('./database/db');

app.use(express.json());

// Middleware for validation
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Utility function to handle database responses
const createResponseHandler = (res, successStatus, notFoundMessage) => {
  return (err, result) => {
    if (err) {
      if (err.code === 'SQLITE_CONSTRAINT' && err.message.includes('UNIQUE constraint failed: events.event_date')) {
        return res.status(409).json({
          error: {
            code: "DUPLICATE_ENTRY",
            message: "Event for this date already exists."
          }
        });
      }
      return res.status(500).send(err.message);
    }
    if (!result || (result.changes !== undefined && result.changes === 0)) {
      return res.status(404).json({
        error: {
          code: "NOT_FOUND",
          message: notFoundMessage || "Resource not found."
        }
      });
    }
    if (successStatus === 204) {
        return res.status(204).send();
    }
    res.status(successStatus).json(result);
  };
};

// Get all events, with optional date filtering
app.get(
    `/api/${version}/events`,
    [
        query('start_date').optional().isDate({ format: 'YYYY-MM-DD' }).withMessage('start_date must be in YYYY-MM-DD format'),
        query('end_date').optional().isDate({ format: 'YYYY-MM-DD' }).withMessage('end_date must be in YYYY-MM-DD format'),
    ],
    validate,
    (req, res) => {
        const { start_date, end_date } = req.query;
        getAllEvents(start_date, end_date, createResponseHandler(res, 200));
    }
);

// Add a new event
app.post(
  `/api/${version}/events`,
  [
    body('event_date').isDate({ format: 'YYYY-MM-DD' }).withMessage('event_date must be in YYYY-MM-DD format'),
    body('content').isString().notEmpty().withMessage('content is required'),
  ],
  validate,
  (req, res) => {
    const { event_date, content } = req.body;
    addEvent(event_date, content, createResponseHandler(res, 201));
  }
);

// Get an event by ID
app.get(
  `/api/${version}/events/:id`,
  [
    param('id').isInt({ min: 1 }).withMessage('ID must be a positive integer'),
  ],
  validate,
  (req, res) => {
    const { id } = req.params;
    getEventById(id, createResponseHandler(res, 200, `Event with ID ${id} not found.`));
  }
);

// Get an event by date
app.get(
    `/api/${version}/events/by-date/:date`,
    [
        param('date').isDate({ format: 'YYYY-MM-DD' }).withMessage('date must be in YYYY-MM-DD format'),
    ],
    validate,
    (req, res) => {
        const { date } = req.params;
        getEventByDate(date, createResponseHandler(res, 200, `Event for date ${date} not found.`));
    }
);

// Update an event
app.put(
  `/api/${version}/events/:id`,
  [
    param('id').isInt({ min: 1 }).withMessage('ID must be a positive integer'),
    body('event_date').optional().isDate({ format: 'YYYY-MM-DD' }).withMessage('event_date must be in YYYY-MM-DD format'),
    body('content').optional().isString().notEmpty().withMessage('content cannot be empty'),
  ],
  validate,
  (req, res) => {
    const { id } = req.params;
    getEventById(id, (err, originalEvent) => {
        if (err) {
            return res.status(500).send(err.message);
        }
        if (!originalEvent) {
            return res.status(404).json({
                error: {
                    code: "NOT_FOUND",
                    message: `Event with ID ${id} not found.`
                }
            });
        }

        const { event_date = originalEvent.event_date, content = originalEvent.content } = req.body;

        if (req.body.event_date === undefined && req.body.content === undefined) {
            return res.status(400).json({
                errors: [{
                    msg: 'At least one field (event_date or content) must be provided for update'
                }]
            });
        }

        updateEvent(id, event_date, content, createResponseHandler(res, 200, `Event with ID ${id} not found.`));
    });
  }
);

// Delete an event
app.delete(
  `/api/${version}/events/:id`,
  [
    param('id').isInt({ min: 1 }).withMessage('ID must be a positive integer'),
  ],
  validate,
  (req, res) => {
    const { id } = req.params;
    deleteEvent(id, createResponseHandler(res, 204, `Event with ID ${id} not found.`));
  }
);

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
  });
}

module.exports = app;
