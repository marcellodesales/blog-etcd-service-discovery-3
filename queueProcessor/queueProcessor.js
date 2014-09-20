var pkgjson = require('./package.json'),
    path = require('path'),
    Etcd = require('node-etcd');

var etcd = new Etcd();

function etcdDiscover(name, options, callback) {
  var key = path.join('/', 'docker-images-build/', name);
  etcd.get(key, options, function (err, value) {
    if (err) {
      return callback(err);
    }
    // for whatever reason I got a failure here on RHEL 6.5 install
    if (!value) {
      return new Error("Undefined Value: " + value);
    }
    var key = value.node.key;

    var value = value.node.value ? JSON.parse(value.node.value) : {};
    return callback(null, {key: key, value: value} , etcd.watcher(key));
  });
}

console.log(pkgjson.name + ' is looking for new items in the queue \'/docker-images-build/queue\'...');

var options = {wait: true, recursive: true};

function handler(err, node, watcher) {
  if (err) {
    console.log(err.message);
    process.exit(1);
  }
  console.log(pkgjson.name + ' discovered node: ', node);
  watcher
    .on('create', function (data) {
      console.log('Value created; new value: ', node);
    })
    .on('change', function (data) {
      console.log('Value changed; new value: ', node);
    })
    .on('delete', function (data) {
      console.log('Value deleted.');
    });
    etcdDiscover('queue', options, handler);

    // deleting the key received after "processing it".
    etcd.del(node.key);
};

etcdDiscover('queue', options, handler);
