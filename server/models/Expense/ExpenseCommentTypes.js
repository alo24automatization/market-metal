const {Schema, model, Types} = require('mongoose');
const Joi = require('joi');

const expenseCommentType = new Schema(
    {
        expenses: [{type: Schema.Types.ObjectId, ref: "Expense"}],
        comment: {type: String, required: true},
        market: {type: Schema.Types.ObjectId, ref: "Market", required: true}
    },
    {
        timestamps: true,
    }
);

function validateExpenseCommentTypes(expense) {
    const schema = Joi.object({
        comment: Joi.string().required(),
        market: Joi.string().required()
    });

    return schema.validate(expense);
}

module.exports.validateExpenseCommentTypes = validateExpenseCommentTypes;
module.exports.ExpenseCommentType = model('ExpenseCommentType', expenseCommentType);
