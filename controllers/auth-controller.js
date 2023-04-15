const User = require("../models/user-model");
const authUtil = require("../util/authentication");
const validation = require("../util/validation");
const sessionFlash = require("../util/session-flash");

function getSignup(req, res) {
  let sessionData = sessionFlash.getSessionData(req);

  if(!sessionData) {
    sessionData = {
      userEmail: "",
      confirmEmail: "",
      userPassword: "",
      fullname: "",
      locality: "",
      postal: "",
      city: "",
    };
  }

  res.render("customer/auth/signup", {inputData: sessionData});
}

async function signup(req, res, next) {
  const enteredData = {
    userEmail: req.body.userEmail,
    confirmEmail: req.body.confirmEmail,
    userPassword: req.body.userPassword,
    fullname: req.body.fullname,
    locality: req.body.locality,
    postal: req.body.postal,
    city: req.body.city
  };

  if (
    !validation.userDetailsAreValid(
      req.body.userEmail,
      req.body.userPassword,
      req.body.fullname,
      req.body.locality,
      req.body.postal,
      req.body.city
    ) || !validation.emailIsConfirmed(req.body.userEmail, req.body.confirmEmail)
  ) {
    sessionFlash.flashDataToSession(req, {
      errorMessage: "Please check your input. Password and postal code must be 6 characters long.",
      ...enteredData
    }, function() {
      res.redirect("/signup");
    })
    return;
  }

  const user = new User(
    req.body.userEmail,
    req.body.userPassword,
    req.body.fullname,
    req.body.locality,
    req.body.postal,
    req.body.city
  );

  try {
    const existsAlready = await user.alreadyExists();

    if(existsAlready) {
      sessionFlash.flashDataToSession(req, {
        errorMessage: "User exists already! Try logging in instead.",
        ...enteredData
      }, function() {
        res.redirect("/signup");
      });
      return;
    }
    
    await user.signup();
  } catch (error) {
    next(error);
    return;
  }

  res.redirect("/login");
}

function getLogin(req, res) {
  let sessionData = sessionFlash.getSessionData(req);

  if(!sessionData) {
    sessionData = {
      email: "",
      password: "",
    };
  }

  res.render("customer/auth/login", {inputData: sessionData});
}

async function login(req, res, next) {
  const user = new User(req.body.userEmail, req.body.userPassword);
  let existingUser;
  try {
    existingUser = await user.getUserWithSameEmail();
  } catch (error) {
    next(error);
    return;
  }

  const sessionErrorData = {
    errorMessage: "Invalid Credentials! Check your email and password",
    email: user.email,
    password: user.password,
  };

  if (!existingUser) {
    sessionFlash.flashDataToSession(req, sessionErrorData, function() {
      res.redirect("/login");
    });
    return;
  }

  const passwordIsCorrect = await user.comparePassword(existingUser.password);

  if (!passwordIsCorrect) {
    sessionFlash.flashDataToSession(req, sessionErrorData, function() {
      res.redirect("/login");
    });
    return;
  }

  authUtil.createUserSession(req, existingUser, function () {
    res.redirect("/");
  });
}

function logout(req, res) {
  authUtil.destroyUserAuthSession(req);
  res.redirect("/login");
}

module.exports = {
  getSignup: getSignup,
  getLogin: getLogin,
  signup: signup,
  login: login,
  logout: logout,
};
