const { Schema, model } = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose").default;

const UserSchema = new Schema({
  username: {
    type: String,
    unique: true,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
});

UserSchema.plugin(passportLocalMongoose);

module.exports = model("User", UserSchema);
