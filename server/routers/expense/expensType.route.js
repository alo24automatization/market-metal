const { Router } = require('express');
const router = Router();
const auth = require('../../middleware/auth.middleware');

router.post('/', auth, (req, res) => {
  require('./expensType').getTypes(req, res);
});

router.post('/register', auth, (req, res) => {
  require('./expensType').createType(req, res);
});


module.exports = router;
