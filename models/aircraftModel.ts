import { Schema, model, Document, Types } from 'mongoose';


const aircraftCategories = [
    "Single Engine Piston",
    "Multi Engine Piston",
    "Jets",
    "Helicopters",
    "Trubo Prop",
    "Warbirds",
    "Special Use",
    "Light Sport"
] as const; // Makes the array read-only

export interface IAircraft extends Document<Types.ObjectId> {
    aircraftName: string;
    serialNumber: string;
    manufacturer: string;
    aircraftModel: string;
    category: string;
    year: string;
    description: string;
    price: number;
    images: string[]; // Array of file paths or URLs
    video?: string;
    // company: string;
    address: string;
    country: string;
    city: string;
    province?: string;
    postalCode?: string;
    totalTime?: string;
    totalLandings?: string;
    maintenanceTracking?: string;
    partsMaintenanceProgram?: string;
    airframeNotes?: string;
    avionics?: string;
    engineMaintenanceProgram?: string;
    engine01Model?: string;
    engine01Serial?: string;
    engine01Time?: string;
    engine01Cycles?: string;
    engine01TBO?: string;
    engine01OnCondition?: string;
    engine01Notes?: string;
    engine02Model?: string;
    engine02Serial?: string;
    engine02Time?: string;
    engine02Cycles?: string;
    engine02TBO?: string;
    engine02OnCondition?: string;
    engine02Notes?: string;
    interiorNotes?: string;
    exteriorNotes?: string;
    additionalEquipment?: string;
    createdAt?: Date;
    updatedAt?: Date;
    isApproved: boolean;
    user: Types.ObjectId;
}

const aircraftSchema = new Schema<IAircraft>(
    {
        aircraftName: { type: String, required: true },
        serialNumber: { type: String, required: true },
        manufacturer: { type: String, required: true },
        aircraftModel: { type: String, required: true },
        category: {
            type: String,
            required: true,
            enum: aircraftCategories,
            message: "Invalid category selection!"
        },
        year: { type: String, required: true },
        description: { type: String, required: true },
        price: { type: Number, required: true },
        images: {
            type: [String],
            required: true,
            validate: {
                validator: (images: string[]) => images.length > 0,
                message: 'At least one image is required.',
            },
        },
        video: { type: String },
        // company: { type: String, required: true },
        address: { type: String, required: true },
        country: { type: String, required: true },
        city: { type: String, required: true },
        province: { type: String },
        postalCode: { type: String },
        totalTime: { type: String },
        totalLandings: { type: String },
        maintenanceTracking: { type: String },
        partsMaintenanceProgram: { type: String },
        airframeNotes: { type: String },
        avionics: { type: String },
        engineMaintenanceProgram: { type: String },
        engine01Model: { type: String },
        engine01Serial: { type: String },
        engine01Time: { type: String },
        engine01Cycles: { type: String },
        engine01TBO: { type: String },
        engine01OnCondition: { type: String },
        engine01Notes: { type: String },
        engine02Model: { type: String },
        engine02Serial: { type: String },
        engine02Time: { type: String },
        engine02Cycles: { type: String },
        engine02TBO: { type: String },
        engine02OnCondition: { type: String },
        engine02Notes: { type: String },
        interiorNotes: { type: String },
        exteriorNotes: { type: String },
        additionalEquipment: { type: String },
        isApproved: { type: Boolean, default: false },
        user: { type: Schema.Types.ObjectId, ref: 'User' }
    },
    { timestamps: true }
);

// Create the Mongoose Model
const AircraftModel = model('Aircraft', aircraftSchema);

export default AircraftModel;