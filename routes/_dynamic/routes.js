const express = require('express');
const router = express.Router();

const { getFieldList } = require('./controller.js');

router.route('/fieldList').get(getFieldList);

module.exports = router;
