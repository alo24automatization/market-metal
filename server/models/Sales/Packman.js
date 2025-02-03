const { Schema, model, Types } = require("mongoose");
const Joi = require("joi");

const packmanSchema = new Schema(
  {
    name: { type: String, required: true },
    market: { type: Schema.Types.ObjectId, ref: "Market", required: true },
    commission: { type: Number, required: true, default: 0 },
    isArchive: { type: Boolean, default: false },
    clients: [{ type: Schema.Types.ObjectId, ref: "Client" }],
    payments: [{ type: Schema.Types.ObjectId, ref: "AgentPayment"}],
  },
  {
    timestamps: true,
  }
);

function validatePackman(packman) {
  const schema = Joi.object({
    name: Joi.string().required(),
    commission: Joi.number().required(),
    market: Joi.string().required(),
  });

  return schema.validate(packman);
}

module.exports.validatePackman = validatePackman;
module.exports.Packman = model("Packman", packmanSchema);
