const Templates = require('./Templates');

Templates.get()
  .then((data) => {
    const treated = Templates.checkConfits(data);
    console.log(treated);
  })
  .catch((err) => {
    console.log(err);
  });
