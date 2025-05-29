import mongoose from "mongoose";

const signatureSchema = new mongoose.Schema({
    msgid: { type: mongoose.Schema.Types.ObjectId, ref: "Message", required: true },
    signedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    signature: { type: String, required: true },
});

const Signatures = mongoose.model("Signature", signatureSchema);
export default Signatures;
