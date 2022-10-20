const handleErrors = (err, req, res, next) => {
  const errJson = {
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  };
  let statusCode = err.code ? err.code : res.statusCode;
  statusCode = statusCode === 200 ? 500 : statusCode;
  return res.status(statusCode).json(errJson);
};

module.exports = {
  handleErrors: handleErrors,
};
