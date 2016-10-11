var koa = require('koa');
var router = require('koa-router')();
var koaBody = require('koa-body')({multipart: true});
var koaCors = require('kcors');
var zoho = require('zoho');
var env = require('node-env-file');

// -- Read config from ENV --
env(__dirname + '/../.env', {overwrite: true, raise: false});
var port = process.env.PORT || 3000;
var apiKey = process.env.ZOHO_API_KEY;

if (!apiKey) {
  console.error("No API key found! Set the ZOHO_API_KEY env var.");
  process.exit(1);
}


// -- Server instances --
var app = koa();
app.use(koaCors());
var crm = new zoho.CRM({authtoken: apiKey});



// -- Routes --

// Index
router.get('/', function *(next) {
  this.body = 'Nothing to see here, move along.'
});

// POST new entry
router.post('/', koaBody, function *(next) {
  const data = this.request.body.fields || this.request.body
  var section = data._section || 'Contacts';
  yield new Promise((resolve, reject) => {
    crm.createRecord(section, data, (err, res) => {
      err ? reject(err) : resolve(res)
    });
  }).then(() => {
    this.body = 'Success!';
  }).catch((err) => {
    this.body = 'Error!';
    this.status = 400;
    console.warn(err);
  });
});


// -- Start server --

app
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(port);
console.log('Listening on port', port);
