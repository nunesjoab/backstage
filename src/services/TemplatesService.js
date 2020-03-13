const db = require('../db');

const checkconflicts = (id, tenant) => new Promise((resolve, reject) => {
  try {
    let query;
    if (id !== undefined) {
      query = `SELECT a.template_id, b.template_id AS conflict FROM ${tenant}.attrs a \
      INNER JOIN ${tenant}.attrs b ON a.label = b.label AND a.template_id <> b.template_id \
      WHERE a.template_id in ${id}
      GROUP BY a.template_id, b.template_id ORDER by a.template_id, b.template_id`;
    } else {
      query = `SELECT a.template_id, b.template_id AS conflict FROM ${tenant}.attrs a \
      INNER JOIN ${tenant}.attrs b ON a.label = b.label AND a.template_id <> b.template_id \
      GROUP BY a.template_id, b.template_id ORDER BY a.template_id, b.template_id`;
    }

    db.query(query)
      .then((data) => {
        const result = {};
        data.rows.forEach((item) => {
          result[item.template_id] = result[item.template_id] === undefined
            ? result[item.template_id] = [item.conflict]
            : result[item.template_id] = result[item.template_id].concat(item.conflict);
        });
        resolve(result);
      })
      .catch((err) => {
        reject(err);
      });
  } catch (e) {
    reject(e);
  }
});
module.exports = { checkconflicts };
