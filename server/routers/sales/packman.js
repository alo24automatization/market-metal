const { Packman, validatePackman } = require("../../models/Sales/Packman.js");
const { Market } = require("../../models/MarketAndBranch/Market");
const {
  DailySaleConnector,
} = require("../../models/Sales/DailySaleConnector.js");
const { SaleConnector } = require("../../models/Sales/SaleConnector.js");
const { AgentPayment } = require("../../models/Sales/AgentPayment.js");
const { Payment } = require("../../models/Sales/Payment.js");
const { Discount } = require("../../models/Sales/Discount.js");
const { SaleProduct } = require("../../models/Sales/SaleProduct.js");
module.exports.register = async (req, res) => {
  try {
    const { name, commission, market, currentPage, countPage, search } =
      req.body;
    const { error } = validatePackman({ name, market, commission });
    if (error) {
      return res.status(400).json({
        error: error.message,
      });
    }

    const marke = await Market.findById(market);
    if (!marke) {
      return res.status(400).json({
        message: `Diqqat! Do'kon haqida malumotlar topilmadi.`,
      });
    }

    const packman = await Packman.findOne({
      name,
      market,
    });
    if (packman) {
      return res.status(400).json({
        message: `Diqqat! ${name} yetkazuvchi avval yaratilgan!`,
      });
    }

    const newPackman = new Packman({
      name,
      market,
      commission,
    });

    await newPackman.save();
    const namepackman = new RegExp(
      ".*" + search ? search.name : "" + ".*",
      "i"
    );

    const packmansCount = await Packman.find({
      market,
      name: namepackman,
    }).count();

    const packmans = await Packman.find({ market, name: namepackman })
      .sort({ _id: -1 })
      .select("name market commission payments")
      .populate("payments")
      .populate("clients")
      .lean()
      .skip(currentPage * countPage)
      .limit(countPage);
    const packmansWithAllProfitAndTotalSum = await getTotalSumPackmanClientsSum(
      market,
      packmans
    );
    res.status(201).json({
      packmans: packmansWithAllProfitAndTotalSum,
      count: packmansCount,
    });
  } catch (error) {
    res.status(400).json({ error: "Serverda xatolik yuz berdi..." });
  }
};

module.exports.getAll = async (req, res) => {
  try {
    const { market } = req.body;
    const marke = await Market.findById(market);
    if (!marke) {
      return res.status(400).json({
        message: "Diqqat! Do'kon haqida malumotlari topilmadi!",
      });
    }
    const packmans = await Packman.find({ market })
      .sort({ _id: -1 })
      .select("name market commission payments")
      .populate("payments")
      .populate("clients")
      .lean();
    res.status(201).json(packmans);
  } catch (error) {
    console.log(error.message);
    res.status(501).json({ error: "Serverda xatolik yuz berdi..." });
  }
};

module.exports.updatePackman = async (req, res) => {
  try {
    const { _id, market, name, commission, search, countPage, currentPage } =
      req.body;
    const marke = await Market.findById(market);
    if (!marke) {
      return res
        .status(400)
        .json({ message: "Diqqat! Do'kon haqida malumot topilmadi!" });
    }
    const packman = await Packman.findById(_id);
    if (!packman) {
      return res
        .status(400)
        .json({ message: `Diqqat! ${name} yetkazuvchi avval yaratilmagan` });
    }

    await Packman.findByIdAndUpdate(_id, {
      name,
      commission,
    });

    await Packman.findById(_id)
      .select("name market commission payments")
      .populate("payments");

    const namepackman = new RegExp(
      ".*" + search ? search.name : "" + ".*",
      "i"
    );

    const packmansCount = await Packman.find({
      market,
      name: namepackman,
    }).count();
    const packmans = await Packman.find({ market, name: namepackman })
      .sort({ _id: -1 })
      .select("name market commission payments")
      .populate("payments")
      .populate("clients")
      .lean()
      .skip(currentPage * countPage)
      .limit(countPage);
    const packmansWithAllProfitAndTotalSum = await getTotalSumPackmanClientsSum(
      market,
      packmans
    );
    res.status(201).json({
      packmans: packmansWithAllProfitAndTotalSum,
      count: packmansCount,
    });
  } catch (error) {
    res.status(501).json({ error: "Serverda xatolik yuz berdi..." });
  }
};

module.exports.deletePackman = async (req, res) => {
  try {
    const { _id, market, name, search, currentPage, countPage } = req.body;
    const marke = await Market.findById(market);
    if (!marke) {
      return res
        .status(400)
        .json({ message: "Diqqat! Do'kon haqida malumot topilmadi!" });
    }
    const packman = await Packman.findById(_id);
    if (!packman) {
      return res
        .status(400)
        .json({ message: `Diqqat! ${name} yetkazuvchi avval yaratilmagan!` });
    }

    if (packman.clients && packman.clients.length > 0) {
      return res.status(400).json({
        message: `Diqqat!  Agentda mijozlar mavjudligi sababli agentni ro'yxatdan o'chirishning imkoni mavjud emas!`,
      });
    }

    await Packman.findByIdAndDelete(_id);

    const namepackman = new RegExp(
      ".*" + search ? search.name : "" + ".*",
      "i"
    );

    const packmansCount = await Packman.find({
      market,
      name: namepackman,
    }).count();
    const packmans = await Packman.find({ market, name: namepackman })
      .sort({ _id: -1 })
      .select("name market commission payments")
      .populate("payments")
      .populate("clients")
      .lean()
      .skip(currentPage * countPage)
      .limit(countPage);
    const packmansWithAllProfitAndTotalSum = await getTotalSumPackmanClientsSum(
      market,
      packmans
    );
    res.status(201).json({
      packmans: packmansWithAllProfitAndTotalSum,
      count: packmansCount,
    });
  } catch (error) {
    res.status(501).json({ error: "Serverda xatolik yuz berdi..." });
  }
};
module.exports.payProfit = async (req, res) => {
  try {
    const convertToUsd = (value) => Math.round(value * 1000) / 1000;
    const convertToUzs = (value) => Math.round(value);
    const { payment, market, user } = req.body;
    const marke = await Market.findById(market);
    if (!marke) {
      return res.status(400).json({
        message: `Diqqat! Do'kon haqida malumotlar topilmadi!`,
      });
    }
    const foudedPackman = await Packman.findById(payment.packman._id);
    if (!foudedPackman) {
      return res.status(400).json({
        message: `Diqqat! Agent haqida malumotlar topilmadi!`,
      });
    }
    const newPayment = new AgentPayment({
      comment: payment.comment,
      payment: 0,
      paymentuzs: convertToUzs(
        payment.carduzs + payment.cashuzs + payment.transferuzs
      ),
      card: convertToUsd(payment.card),
      cash: convertToUsd(payment.cash),
      transfer: convertToUsd(payment.transfer),
      carduzs: convertToUzs(payment.carduzs),
      cashuzs: convertToUzs(payment.cashuzs),
      transferuzs: payment.transferuzs,
      type: payment.type,
      totalprice: 0,
      totalpriceuzs: payment.totalpriceuzs,
      market,
      packman: payment.packman,
      packman_saleconnectors: payment.packman_saleconnectors.map(
        (item) => item.saleconnector._id
      ),
      user,
    });
    await newPayment.save();
    foudedPackman.payments.push(newPayment);
    await foudedPackman.save();
    res.status(201).json(newPayment);
  } catch (error) {
    console.log(error.message);
    res.status(501).json({ error: "Serverda xatolik yuz berdi..." });
  }
};
module.exports.getPackmans = async (req, res) => {
  try {
    const { market, currentPage, countPage, search } = req.body;
    const marke = await Market.findById(market);
    if (!marke) {
      return res
        .status(401)
        .json({ message: "Diqqat! Do'kon malumotlari topilmadi." });
    }

    const name = new RegExp(".*" + (search ? search.name : "") + ".*", "i");

    const packmansCount = await Packman.find({ market, name: name }).count();

    const packmans = await Packman.find({ market, name: name })
      .sort({ _id: -1 })
      .select("name market commission payments")
      .populate("payments")
      .populate("clients")
      .lean()
      .skip(currentPage * countPage)
      .limit(countPage);

    const packmansWithAllProfitAndTotalSum = await getTotalSumPackmanClientsSum(
      market,
      packmans
    );
    packmansWithAllProfitAndTotalSum.sort((a, b) => b.totalSum - a.totalSum);
    res.status(201).json({
      packmans: packmansWithAllProfitAndTotalSum,
      count: packmansCount,
    });

  } catch (error) {
    console.warn(error.message);
    res.status(501).json({ error: "Serverda xatolik yuz berdi..." });
  }
};
const getTotalSumPackmanClientsSum = async (market, packmans) => {
  const newPackmansWithProfits = await Promise.all(
    packmans.map(async (packman) => {
      const { allClients, totalSum } = await fetchClientTotalSaleSum(
        packman.clients,
        market
      );
      return {
        ...packman,
        clients: allClients.filter((item) => item.saleconnector),
        totalSum: totalSum,
        commissionProfit: (totalSum * packman.commission) / 100 || 0,
      };
    })
  );
  return newPackmansWithProfits;
};
const fetchClientTotalSaleSum = async (clients, market) => {
  const allClients = [];
  const reduceForSales = (arr, key) => {
    return arr.reduce((prev, connector) => {
      prev.push(...connector[key]);
      return prev;
    }, []);
  };
  for (let client of clients) {
    const saleconnectors = await SaleConnector.find({
      market,
      client: client._id,
    })
      .select("-isArchive -market -__v")
      .sort({ createdAt: -1 })
      .populate({
        path: "products",
        select: "user",
        populate: {
          path: "user",
          select: "firstname lastname",
        },
      })
      .populate({
        path: "products",
        select: "price",
        populate: {
          path: "price",
          select: "incomingprice incomingpriceuzs",
        },
      })
      .populate({
        path: "products",
        select:
          "totalprice unitprice totalpriceuzs unitpriceuzs pieces createdAt discount saleproducts product",
        options: { sort: { createdAt: -1 } },
        populate: {
          path: "product",
          select: "productdata",
          populate: { path: "productdata", select: "name code" },
        },
      })
      .populate(
        "payments",
        "payment paymentuzs comment totalprice totalpriceuzs createdAt"
      )
      .populate(
        "discounts",
        "discount discountuzs procient products totalprice totalpriceuzs"
      )
      .populate({ path: "client", select: "name phoneNumber" })
      .populate("packman", "name")
      .populate("user", "firstname lastname")
      .populate("dailyconnectors", "comment")
      .lean();
    for (const connector of saleconnectors) {
      const products = await SaleProduct.find({
        saleconnector: connector._id,
      }).lean();
      const productstotalusd = [...products].reduce(
        (prev, el) => prev + el.totalprice,
        0
      );
      const productstotaluzs = [...products].reduce(
        (prev, el) => prev + el.totalpriceuzs,
        0
      );
      const payments = await Payment.find({
        saleconnector: connector._id,
      }).lean();
      const paymentstotalusd = [...payments].reduce(
        (prev, el) => prev + el.payment,
        0
      );
      const paymentstotaluzs = [...payments].reduce(
        (prev, el) => prev + el.paymentuzs,
        0
      );

      const discounts = await Discount.find({
        saleconnector: connector._id,
      }).lean();

      const discountstotalusd = [...discounts].reduce(
        (prev, el) => prev + el.discount,
        0
      );
      const discountstotaluzs = [...discounts].reduce(
        (prev, el) => prev + el.discountuzs,
        0
      );
      totaldebtusd = productstotalusd - paymentstotalusd - discountstotalusd;
      totaldebtuzs = productstotaluzs - paymentstotaluzs - discountstotaluzs;  
      let s = {
        _id: connector._id,
        dailyconnectors: connector.dailyconnectors,
        debts:
          connector.debts.length > 0
            ? [connector.debts[connector.debts.length - 1]]
            : connector.debts,
        user: connector.user,
        createdAt: connector.createdAt,
        totalsalesuzs:productstotaluzs,
        updatedAt: connector.updatedAt,
        client: connector.client,
        id: connector.id,
        products:products,
        payments: connector.payments,
        saleconnector: {...connector},
        totaldebtusd: totaldebtusd,
        totaldebtuzs: totaldebtuzs,
      };
      const newClient = {
        _id: client._id,
        name: client.name,
        market: client.market,
        packman: client.packman,
        saleconnector: s,
        phoneNumber: client.phoneNumber,
      };
      allClients.push(newClient);
    }
    // let s = null;
    // let totaldebtuzs = 0;
    // if (saleconnectors.length > 0) {
    //   const payments = reduceForSales(saleconnectors, "payments");
    //   const products = reduceForSales(saleconnectors, "products");
    //   const debts = reduceForSales(saleconnectors, "debts");
    //   const discounts = reduceForSales(saleconnectors, "discounts");
    //   const dailyconnectors = reduceForSales(saleconnectors, "dailyconnectors");
    //   const totalsales = [...products].reduce(
    //     (prev, el) => prev + el.totalprice || 0,
    //     0
    //   );
    //   const totalsalesuzs = [...products].reduce(
    //     (prev, el) => prev + el.totalpriceuzs || 0,
    //     0
    //   );
    //   const incomings = [...products].reduce(
    //     (prev, el) =>
    //       prev + el.pieces * ((el.price && el.price.incomingprice) || 0),
    //     0
    //   );
    //   const incomingsuzs = [...products].reduce(
    //     (prev, el) =>
    //       prev + el.pieces * ((el.price && el.price.incomingpriceuzs) || 0),
    //     0
    //   );

    //   const productstotaluzs = [...products].reduce(
    //     (prev, el) => prev + el.totalpriceuzs,
    //     0
    //   );
    //   const paymentstotaluzs = [...payments].reduce(
    //     (prev, el) => prev + el.paymentuzs,
    //     0
    //   );
    //   const discountstotaluzs = [...discounts].reduce(
    //     (prev, el) => prev + el.discountuzs,
    //     0
    //   );
    //   totaldebtuzs = productstotaluzs - paymentstotaluzs - discountstotaluzs;
    //   s = {
    //     products: products,
    //     payments: payments,
    //     debts: debts,
    //     discounts: discounts,
    //     dailyconnectors: dailyconnectors,
    //     user: saleconnectors[0].user,
    //     createdAt: saleconnectors[0].createdAt,
    //     totalsales: totalsales,
    //     totalsalesuzs: totalsalesuzs,
    //     profit: totalsales - incomings,
    //     profituzs: totalsalesuzs - incomingsuzs,
    //     id: saleconnectors[0].id,
    //     _id: saleconnectors[0]._id,
    //     totaldebtusd: -1,
    //     totaldebtuzs,
    //   };
    // }
    // allClients.push();
  }
  return {
    totalSum:
      allClients.reduce(
        (prev, item) => prev + item.saleconnector?.totalsalesuzs || 0,
        0
      ) || 0,
    allClients,
  };
};
