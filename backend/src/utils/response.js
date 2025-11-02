const sendResponse = (res, status, success, message, data = null, error = null) => {
  res.status(status).json({
    success,
    message,
    data,
    error,
  });
};

module.exports = sendResponse;