module.exports = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }

  console.log(req.isAuthenticated());

  req.session.returnTo = req.originalUrl;
  res.redirect("/login");
};
