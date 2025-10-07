const { createHmac, randomBytes } = require('crypto');
const { Schema, model } = require("mongoose");
const { createTokenForUser } = require('../services/authentication');

const userSchema = new Schema({
    fullName: {
        type: String,
        require: true,
    },
    email: {
        type: String,
        require: true,
        unique: true,
    },
    salt: {             //using salt, we hash the password
        type: String,
        require: true,
    },
    password: {
        type: String,
        require: true,
    },
    profileImageURL: {
        type: String,
        default: '/images/default.png',
    },
    role: {
        type: String,
        enum: ["USER", "ADMIN"],
        default: "USER",
    }
},
    { timestamps: true }
);

// taken from mongoose pre save example
userSchema.pre("save", function (next) {
    const user = this;

    if (!user.isModified("password")) return;

    // taken from crypto hash node.js
    const salt = randomBytes(16).toString();
    const hashPassword = createHmac('sha256', salt).update(user.password).digest("hex");

    this.salt = salt;
    this.password = hashPassword;

    next();
});

userSchema.static('matchPasswordAndGenerateToken', async function (email, password) {
    const user = await this.findOne({ email });
    if (!user) throw new Error('User not found!');

    const salt = user.salt;
    const hashedPassword = user.password;

    const userProvidedHash = createHmac("sha256", salt).update(password).digest("hex");

    if (hashedPassword !== userProvidedHash) throw new Error('Incorrect Password!');

    const token = createTokenForUser(user);
    return token;
});

const User = model('user', userSchema);

module.exports = User;