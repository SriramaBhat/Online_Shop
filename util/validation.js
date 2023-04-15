function isEmpty(value) {
  return !value || value.trim() === "";
}

function userCredentialsAreValid(email, password) {
  return !isEmpty(email) && email.includes("@") && password.trim().length > 5;
}

function userDetailsAreValid(email, password, name, locality, postal, city) {
  return (
    userCredentialsAreValid(email, password) &&
    !isEmpty(name) &&
    !isEmpty(locality) &&
    !isEmpty(postal) &&
    !isEmpty(city)
  );
}

function emailIsConfirmed(email, confirmEmail) {
  return email === confirmEmail;
}

module.exports = {
  userDetailsAreValid: userDetailsAreValid,
  emailIsConfirmed: emailIsConfirmed,
};
