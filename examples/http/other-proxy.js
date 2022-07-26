/*
  other-proxy.js: Example of proxying over HTTP.
*/

var http = require('http'),
    httpProxy = require('../../lib/http-proxy');

//
// Http Server with proxyRequest Handler and Latency
//
var proxy = new httpProxy.createProxyServer();
http.createServer(function (req, res) {
  setTimeout(function () {
    proxy.web(req, res, {
      target: 'http://neverssl.com:80',
      xfwd: true,	
      prependPath: true,
      secure: false,
      followRedirects: true,
      autoRewrite: true,
      changeOrigin: true,
      selfHandleResponse: true,
    });
  }, 200);
}).listen(process.env.PORT || 3000);

proxy.on('proxyRes', function (proxyRes, req, res) {
	var body = [];
	proxyRes.on('data', function (chunk) {
		body.push(chunk);
	});
	proxyRes.on('end', function () {
		body = Buffer.concat(body).toString();
		console.log("res from proxied server:", body);
		res.end("my response to cli");
	});
});
proxy.on('proxyReq', function(proxyReq, req, res) {
  proxyReq.setHeader('Accept-Encoding', 'identity');
  console.log('proxyReq', req.headers);
});

//
// Target Http Server (old)
//
http.createServer(function (req, res) {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.write('request successfully proxied to: ' + req.url + '\n' + JSON.stringify(req.headers, true, 2));
  res.end();
}).listen(9002);

console.log('http server ' + 'started ' + 'on port ' + '8002 ' + 'with proxy.web() handler' + ' and latency');
console.log('http server ' + 'started ' + 'on port ' + '9002 ');
