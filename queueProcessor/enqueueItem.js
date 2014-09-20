var pkgjson = require('./package.json'),
    path = require('path'),
    Etcd = require('node-etcd');

var etcd = new Etcd();

function etcdRegister() {
  var p = path.join('/', 'docker-images-build', 'queue');
  // method create is used to enqueue values in-order.
  etcd.create(p,
    JSON.stringify({
        hostname: '127.0.0.1',
        port: '3000',
        pid: process.pid,
        name: pkgjson.name,
        on: new Date()
      }));
  setTimeout(etcdRegister, 5000);
  return p;
}

console.log(pkgjson.name + ' registered with etcd as ' + etcdRegister());
