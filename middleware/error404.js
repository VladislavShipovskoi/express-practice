module.exports = (req, res) => {
  res.status(404);
  res.json({ message: "Page not found" });
};
