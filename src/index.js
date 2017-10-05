var koa = require('koa');
var router = require('koa-router')();
var koaBody = require('koa-body')({multipart: true});
var koaCors = require('kcors');
var zoho = require('zoho');
var env = require('node-env-file');
var uuid1 = require('uuid/v1');

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

var sessions = {};
// POST new entry
router.post('/', koaBody, function *(next) {
  const data = this.request.body.fields || this.request.body
  var section = 'CustomModule4';
  var session = data.session;
  yield new Promise((resolve, reject) => {
    if (session) {
      var contact = sessions[session];
      if ((Date.now() - contact.date)/ 3600000 < 1){
        if (contact){
          var accept = { 'accept terms': 'true' };
          crm.updateRecord(section, contact.id , accept, (err, res) => {
            err ? reject(err) : resolve(res)
            delete sessions[session];
          });
        } else {
          reject('Incorrect session');
        }
      } else {
        delete sessions[session];
        reject('Incorrect session 2');
      }
    } else {
      data.ip = this.request.ip
      crm.createRecord(section, data, (err, res) => {
        err ? reject(err) : resolve(res)
      });
    }
  }).then((response) => {
    var id = response.data.FL[0].content;
    var key = uuid1();
    sessions[key] = { id: id, date: Date.now()};
    this.set('Access-Control-Allow-Origin', '*');
    this.body = { session: key }
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
