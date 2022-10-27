const Mongoose = require("mongoose");

const UserSchema = new Mongoose.Schema(
    {
        full_name : String,
        user_name : String,
        password : String,
        email : String,
        isAdmin : {
            type: Boolean,
            default: false
        },
        profile_image : String,
        lastLoginDate: {
            type: String,
            default: "0"
        }
    },
    {timestamps: true, versionKey: false},
);

module.exports = Mongoose.model("user", UserSchema);
