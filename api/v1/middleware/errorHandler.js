const errorHandler = (err, req, res, next) => {
  console.error(err.message);

  if (err.name === 'ValidationError') {
    return res.status(400).send({ message: err.message });
  }

  res.status(500).send({ message: 'Internal server error' });
};

module.exports = errorHandler;
