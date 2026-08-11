const login = (req, res) => {
  passport.authenticate(
    "local",
    {
      failureRedirect: "/login",
    },
    (req, res) => {
      const redirectUrl = req.session.returnTo || "/";
      delete req.session.returnTo;
      res.redirect(redirectUrl);
    },
  );
};

const register = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = new User({ username });
    const registeredUser = await User.register(user, password);

    req.login(registeredUser, (err) => {
      if (err) return next(err);
      res.redirect("/");
    });
  } catch (error) {
    console.error(error);
    res.redirect("/register");
  }
};

module.exports = { login, register };
