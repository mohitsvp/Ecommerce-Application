const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
    {
        first_name : {type: String, required: true},
        last_name : {type: String, required: true},
        email : {type: String, required: true, unique: true},
        mobile : {type: Number, required: true, unique: true},
        password : {type: String, required: true},
        role: {type: String, enum: ['admin', 'super-admin', 'user'], default: 'user'},
        cart: {type: Array, default: []},
        address: [{type: mongoose.Schema.Types.ObjectId, ref: 'Address'}],
        wishlist: [{type: mongoose.Schema.Types.ObjectId, ref: 'Product'}],
        isBlocked: {type: Boolean, default: false},
        refreshToken: {type: String}
    },
    {
        timestamps: true,
        versionKey: false
    }
);

// Encrypt password
userSchema.pre('save', async function(next) {
    let salt = await bcrypt.genSaltSync(10);
    this.password = await bcrypt.hash(this.password, salt);
})

// Comparing entered password
userSchema.methods.isPasswordMatched = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
}


const User = mongoose.model('User', userSchema);

module.exports = User;