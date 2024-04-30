import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    // password: { type: String, required: true },
    profilePicture: String,
    dateOfBirth: Date,
    gender: { type: String, enum: ['male', 'female', 'other'] },
    location: {
        city: String,
        country: String,
    },
    bio: String,
    contactInfo: {
        phone: String,
        socialMedia: {
            twitter: String,
            facebook: String,
            instagram: String,
        },
    },
});

const User = mongoose.model('User', userSchema);

export default User;

