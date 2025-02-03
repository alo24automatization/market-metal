const {ExpenseCommentType, validateExpenseCommentTypes} = require("../../models/Expense/ExpenseCommentTypes");
const {Market} = require("../../models/MarketAndBranch/Market");

module.exports.getTypes = async (req, res) => {
    try {
        const {market} = req.body;
        const marke = await Market.findById(market);
        if (!marke) {
            return res
                .status(401)
                .json({message: "Diqqat! Do'kon ma'lumotlari topilmadi."});
        }
        const types = await ExpenseCommentType.find({market})
        res.status(200).json(types)
    } catch (error) {
        res.status(501).json({error: 'Serverda xatolik yuz berdi...'});
    }
}
module.exports.createType = async (req, res) => {
    try {
        const {error} = validateExpenseCommentTypes(req.body);
        if (error) return res.status(400).json({message: error.details[0].message});

        const {comment, market} = req.body;

        const marketExists = await Market.findById(market);
        if (!marketExists) {
            return res.status(401).json({message: "Diqqat! Do'kon ma'lumotlari topilmadi."});
        }

        let newExpenseCommentType = new ExpenseCommentType({
            comment,
            market,
        });
        newExpenseCommentType = await newExpenseCommentType.save();
        res.status(201).json(newExpenseCommentType);
    } catch (error) {
        res.status(501).json({error: 'Serverda xatolik yuz berdi...'});
    }
}
