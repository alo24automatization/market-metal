const { Schema, model, Types } = require("mongoose");
const Joi = require("joi");

const agentPaymentSchema = new Schema(
  {
    totalprice: { type: Number },
    totalpriceuzs: { type: Number },
    products: [{ type: Schema.Types.ObjectId, ref: "Product", required: true }],
    payment: { type: Number, required: true },
    paymentuzs: { type: Number, required: true },
    cash: { type: Number, required: true },
    cashuzs: { type: Number, required: true },
    card: { type: Number, required: true },
    carduzs: { type: Number, required: true },
    transfer: { type: Number, required: true },
    transferuzs: { type: Number, required: true },
    type: { type: String, required: true },
    packman: { type: Schema.Types.ObjectId, ref: "Packman" },
    packman_saleconnectors: [{ type: Schema.Types.ObjectId, ref: "SaleConnector" }],
    comment: { type: String },
    saleconnector: { type: Schema.Types.ObjectId, ref: "SaleConnector" },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    market: { type: Schema.Types.ObjectId, ref: "Market", required: true },
    isArchive: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

function validateAgentPayment(payment) {
  const schema = Joi.object({
    totalprice: Joi.number(),
    totalpriceuzs: Joi.number(),
    products: Joi.array().required(),
    payment: Joi.number(),
    paymentuzs: Joi.number(),
    card: Joi.number(),
    carduzs: Joi.number(),
    cash: Joi.number(),
    cashuzs: Joi.number(),
    transfer: Joi.number(),
    transferuzs: Joi.number(),
    type: Joi.string(),
    comment: Joi.string(),
    saleconnector: Joi.string(),
    packman: Joi.string(),
    packman_saleconnectors: Joi.array(),
    user: Joi.string().required(),
    market: Joi.string().required(),
  });
  return schema.validate(payment);
}

module.exports.validateAgentPayment = validateAgentPayment;
module.exports.AgentPayment = model("AgentPayment", agentPaymentSchema);
