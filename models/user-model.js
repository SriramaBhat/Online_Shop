const bcrypt = require("bcryptjs");
const mongodb = require("mongodb");
const db = require("../data/database");

class User {
  constructor(email, password, fullname, locality, postal, city) {
    this.email = email;
    this.password = password;
    this.name = fullname;
    this.address = {
      locality: locality,
      postal: postal,
      city: city,
    };
  }

  async signup() {
    const hashedPassword = await bcrypt.hash(this.password, 12);
    await db.getDb().collection("users").insertOne({
      email: this.email,
      password: hashedPassword,
      name: this.name,
      address: this.address,
    });
  }

  static findById(userId) {
    const uid = new mongodb.ObjectId(userId);

    return db
      .getDb()
      .collection("users")
      .findOne({ _id: uid }, { projection: { password: 0 } });
  }

  getUserWithSameEmail() {
    return db.getDb().collection("users").findOne({ email: this.email });
  }

  async alreadyExists() {
    const existingUser = await this.getUserWithSameEmail();
    if (existingUser) {
      return true;
    }

    return false;
  }

  comparePassword(hashedPassword) {
    return bcrypt.compare(this.password, hashedPassword);
  }
}

module.exports = User;
