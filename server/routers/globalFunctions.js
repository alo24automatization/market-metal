const { reduce, isElement } = require("lodash");
const { SaleConnector } = require("../models/Sales/SaleConnector");
const moment = require("moment");
const { Debt } = require("../models/Sales/Debt");
const { Market } = require("../models/MarketAndBranch/Market");
const { Client } = require("../models/Sales/Client");
const { User } = require("../models/Users");
const axios = require("axios");
const { Discount } = require("../models/Sales/Discount");
const { Payment } = require("../models/Sales/Payment");
const { Product } = require("../models/Products/Product");
const { SaleProduct } = require("../models/Sales/SaleProduct");
const { Category, ProductData, Unit, ProductPrice } =
  require("./constants").models;

const createCategory = ({ market, name, code }) => {
  const newCategory = new Category({
    market,
    name,
    code,
  });
  return newCategory.save();
};

const createProductData = ({
  market,
  name,
  code,
  category,
  product,
  unit,
  barcode,
}) => {
  const newProductData = new ProductData({
    market,
    name,
    code,
    category,
    product,
    unit,
    barcode,
  });
  return newProductData.save();
};

const createUnit = ({ market, name }) => {
  const newUnit = new Unit({
    market,
    name,
  });
  return newUnit.save();
};

const createProduct = ({
  market,
  category,
  productdata,
  unit,
  price,
  minimumcount,
  total,
}) => {
  const newProduct = new Product({
    market,
    category,
    productdata,
    unit,
    price,
    minimumcount,
    total,
  });
  return newProduct.save();
};

const createProductPrice = ({
  market,
  product,
  sellingprice,
  sellingpriceuzs,
  incomingprice,
  incomingpriceuzs,
  tradeprice,
  tradepriceuzs,
}) => {
  const newProductPrice = new ProductPrice({
    market,
    product,
    sellingprice,
    sellingpriceuzs,
    incomingprice,
    incomingpriceuzs,
    tradeprice,
    tradepriceuzs,
  });
  return newProductPrice.save();
};

const sendMessage = async () => {
  console.log("Messaging has started!");
  const formatMessage = (
    name,
    debt,
    pay_end_date,
    market_number,
    market_name,
    isOverdue
  ) => {
    if (isOverdue) {
      return `Xurmatli ${name} sizni ${market_name} dan ${debt} uzs miqdorda qarzingiz mavjud. ${pay_end_date} gacha edi, ammo to'lovingiz kechikdi iltimos o'z vaqtida amalga oshiring. Murojat uchun ${market_number}`;
    } else {
      return `Xurmatli ${name} sizni ${market_name} dan ${debt} uzs miqdorda qarzingiz mavjud. ${pay_end_date} gacha to'lovni amalga oshiring. Murojat uchun ${market_number}`;
    }
  };
  try {
    const now = moment();
    const saleConnectors = await SaleConnector.find();

    const debtsreport = await Promise.all(
      saleConnectors.map(async (sale) => {
        const payments = await Payment.find({ _id: { $in: sale.payments } });
        const client = await Client.findById(sale.client);
        const debts = await Debt.find({ _id: { $in: sale.debts } });
        const discounts = await Discount.find({ _id: { $in: sale.discounts } });
        const products = await SaleProduct.find({
          _id: { $in: sale.products },
        });
        const reduce = (arr, el) =>
          arr.reduce((prev, item) => prev + (item[el] || 0), 0);
        const discount = reduce(discounts, "discount");
        const discountuzs = reduce(discounts, "discountuzs");
        const payment = reduce(payments, "payment");
        const paymentuzs = reduce(payments, "paymentuzs");
        const totalprice = reduce(products, "totalprice");
        const totalpriceuzs = reduce(products, "totalpriceuzs");

        const debtComment =
          debts.length > 0 ? debts[debts.length - 1].comment : "";
        const debtId = debts.length > 0 ? debts[debts.length - 1]._id : "";
        const payEndDate =
          debts.length > 0 ? debts[debts.length - 1].pay_end_date : "";

        return {
          client: client && client,
          totalprice,
          totalpriceuzs,
          debt: Math.round((totalprice - payment - discount) * 1000) / 1000,
          debtuzs:
            Math.round((totalpriceuzs - paymentuzs - discountuzs) * 1) / 1,
          pay_end_date: payEndDate,
        };
      })
    );
    const filteredDebtsReport = debtsreport.filter(
      (sales) => sales.debtuzs > 0
    );
    for (const debt of filteredDebtsReport) {
      const debtEndDate = moment(debt.pay_end_date);
      const daysUntilPayment = debtEndDate.diff(now, "days");
      const isOverdue = daysUntilPayment < 0;
      if (
        debt.debtuzs &&
        debt.debtuzs > 0 &&
        (isOverdue || (daysUntilPayment >= 0 && daysUntilPayment <= 3))
      ) {
        const client = await Client.findById(debt.client).populate({
          path: "market",
          populate: "director",
        });
        const { market } = client;
        const SMS_API_KEY = market.SMS_API_KEY;
        const validPhoneNumber =
          client.phoneNumber && client.phoneNumber.startsWith("+998")
            ? client.phoneNumber.slice(4)
            : client.phoneNumber;
        if (SMS_API_KEY) {
          const response = await axios.get(
            `https://smsapp.uz/new/services/send.php?key=${SMS_API_KEY}&number=${validPhoneNumber}&message=${formatMessage(
              client.name,
              debt.debtuzs,
              debtEndDate.format("MM/DD/YYYY"),
              market.director.phone,
              market.name,
              isOverdue
            )}`
          );
          console.log(`Messaging has ended! success: ${response.data.success}`);
        }
      }
    }
  } catch (error) {
    console.error("Failed to send message:", error.message);
  }
};

//   sendMessageFromMorning
const sendMessageFromMorning = async () => {
  console.log("Morning message sending has started!");
  const formatMessage = (
    name,
    debt,
    pay_end_date,
    market_number,
    market_name,
    isOverdue
  ) => {
    if (isOverdue) {
      return `Xurmatli ${name} sizni ${market_name} dan ${debt} uzs miqdorda qarzingiz mavjud. ${pay_end_date} gacha edi, ammo to'lovingiz kechikdi iltimos o'z vaqtida amalga oshiring. Murojat uchun ${market_number}`;
    } else {
      return `Xurmatli ${name} sizni ${market_name} dan ${debt} uzs miqdorda qarzingiz mavjud. ${pay_end_date} gacha to'lovni amalga oshiring. Murojat uchun ${market_number}`;
    }
  };
  try {
    const now = moment();
    const saleConnectors = await SaleConnector.find();

    const debtsreport = await Promise.all(
      saleConnectors.map(async (sale) => {
        const payments = await Payment.find({ _id: { $in: sale.payments } });
        const client = await Client.findById(sale.client);
        const debts = await Debt.find({ _id: { $in: sale.debts } });
        const discounts = await Discount.find({ _id: { $in: sale.discounts } });
        const products = await SaleProduct.find({
          _id: { $in: sale.products },
        });
        const reduce = (arr, el) =>
          arr.reduce((prev, item) => prev + (item[el] || 0), 0);
        const discount = reduce(discounts, "discount");
        const discountuzs = reduce(discounts, "discountuzs");
        const payment = reduce(payments, "payment");
        const paymentuzs = reduce(payments, "paymentuzs");
        const totalprice = reduce(products, "totalprice");
        const totalpriceuzs = reduce(products, "totalpriceuzs");

        const debtComment =
          debts.length > 0 ? debts[debts.length - 1].comment : "";
        const debtId = debts.length > 0 ? debts[debts.length - 1]._id : "";
        const payEndDate =
          debts.length > 0 ? debts[debts.length - 1].pay_end_date : "";

        return {
          client: client && client,
          totalprice,
          totalpriceuzs,
          debt: Math.round((totalprice - payment - discount) * 1000) / 1000,
          debtuzs:
            Math.round((totalpriceuzs - paymentuzs - discountuzs) * 1) / 1,
          pay_end_date: payEndDate,
        };
      })
    );
    const filteredDebtsReport = debtsreport.filter(
      (sales) => sales.debtuzs > 0
    );
    const delayBetweenMessages = 60 * 1000;

    for (const debt of filteredDebtsReport) {
      const debtEndDate = moment(debt.pay_end_date);
      const daysUntilPayment = debtEndDate.diff(now, "days");
      const isOverdue = daysUntilPayment < 0;
      if (
        debt.debtuzs &&
        debt.debtuzs > 0 &&
        (isOverdue || (daysUntilPayment >= 0 && daysUntilPayment <= 3))
      ) {
        const client = await Client.findById(debt.client).populate({
          path: "market",
          populate: "director",
        });
        const { market } = client;
        const SMS_API_KEY = market.SMS_API_KEY;
        const validPhoneNumber =
          client.phoneNumber && client.phoneNumber.startsWith("+998")
            ? client.phoneNumber.slice(4)
            : client.phoneNumber;
        if (SMS_API_KEY) {
          const response = await axios.get(
            `https://smsapp.uz/new/services/send.php?key=${SMS_API_KEY}&number=${validPhoneNumber}&message=${formatMessage(
              client.name,
              debt.debtuzs,
              debtEndDate.format("MM/DD/YYYY"),
              market.director.phone,
              market.name,
              isOverdue
            )}`
          );
          await new Promise((resolve) =>
            setTimeout(resolve, delayBetweenMessages)
          );
          console.log(
            `Morning message sending ended! success: ${response.data.success}`
          );
        }
      }
    }
  } catch (error) {
    console.error("Failed to send morning message:", error.message);
  }
};
module.exports = {
  createCategory,
  createProductData,
  createUnit,
  createProduct,
  createProductPrice,
  sendMessage,
  sendMessageFromMorning,
};

module.exports.reducer = (arr, el) =>
  reduce(arr, (prev, item) => prev + (item[el] || 0), 0);
module.exports.reducerDuobleProperty = (arr, el1, el2) =>
  reduce(arr, (prev, item) => prev + (item[el1][el2] || 0), 0);

module.exports.roundToUzs = (number) => Math.round(number * 1) / 1;
module.exports.roundToUsd = (number) => Math.round(number * 1000) / 1000;

module.exports.regExpression = (expression) =>
  new RegExp(".*" + expression + ".*", "i");
