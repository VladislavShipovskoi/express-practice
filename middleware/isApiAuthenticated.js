module.exports = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({
    error: "Unauthorized",
    message: "Для доступа к этому ресурсу необходимо войти в систему.",
  });
};
