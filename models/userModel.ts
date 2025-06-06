import { model, Document, Schema, Types } from 'mongoose';
import bcrypt from 'bcrypt'
import crypto from "crypto";

const saltRounds = 12

export interface IUser extends Document<Types.ObjectId> {
    email: string;
    password: string;
    role: 'admin' | 'seller';
    // role: 'admin' | 'seller' | 'buyer';

    name: string;
    // gender: 'male' | 'female' | 'notSpecified';
    // profilePictureUrl?: string;
    // dateOfBirth?: Date;
    // address: string;
    phone: string;
    aircrafts: Types.ObjectId[];
    authMethod: 'self' | 'google';
    active: boolean;
    approve: boolean;
    passwordResetToken: string | undefined;
    passwordResetTokenExpires: Date | undefined;
    lastChangedPassword: Date;
    verificationToken: string | undefined;
    correctPassword: (candidatePassword: string) => Promise<boolean>;
    checkPasswordchanged: (JWTTimestamp: number) => boolean;
    getPasswordResetToken: () => string;
}

const userSchema = new Schema<IUser>(
    {
        email: { type: String, required: true, unique: true },
        password: {
            type: String, required: function () {
                return this.authMethod === 'self'; // Required only if provider is 'email'
            }, select: false
        },
        role: {
            type: String,
            enum: ['admin', 'seller'],
            default: "seller"
            // enum: ['admin', 'seller', 'buyer'],
            // required: true,
        },

        name: { type: String, required: true },
        // gender: {
        //     type: String,
        //     enum: ['male', 'female', 'notSpecified'],
        //     default: 'notSpecified',
        // },
        // profilePictureUrl: String,
        // dateOfBirth: Date,
        // address: String,
        phone: String,
        aircrafts: [
            { type: Schema.Types.ObjectId, ref: 'Aircraft', default: [] },
        ],
        active: {
            type: Boolean,
            default: true,
        },
        approve: {
            type: Boolean,
            default: false,
        },
        authMethod: {
            type: String,
            enum: ['google', 'self'],
            default: 'self'
        },
        passwordResetToken: String,
        passwordResetTokenExpires: Date,
        lastChangedPassword: Date,
        verificationToken: {
            type: String,
            default: undefined,
            select: false
        },
    },
    {
        toObject: { virtuals: true },
        toJSON: {
            virtuals: true,
            transform(doc, ret, options) {
                // Remove passwordHash from any JSON response
                delete ret.password;
                return ret;
            },
        },
    },
);

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
});
userSchema.pre("save", function (next) {
    if (!this.isModified("password") || this.isNew) {
        return next();
    }
    this.lastChangedPassword = new Date(Date.now() - 1000);

    next();
});

userSchema.methods.correctPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

userSchema.methods.checkPasswordchanged = function (JWTTIMESTAMP) {
    if (!this.lastChangedPassword) return 0;
    const time = this.lastChangedPassword.getTime() / 1000;
    return time > JWTTIMESTAMP;
};

userSchema.methods.getPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString("hex");
    this.passwordResetToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");
    this.passwordResetTokenExpires = new Date(Date.now() + 10 * 60 * 1000);; //expire after 10 minutes
    return resetToken;
};


/* Friendship.firstUserId === this._id */
// userSchema.virtual('friendsWith', {
//     ref: 'Friendship',
//     localField: '_id',
//     foreignField: 'firstUserId',
// });


// prettier-ignore
const UserModel = model('User', userSchema);
export default UserModel