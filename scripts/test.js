var childProcess=require('child_process')

var run = function(command){
  var c = childProcess.spawn('npm',['run',command],{ stdio: 'inherit'} )
  c.once('exit',function(code){
    process.exit(code)
  })
}

if(process.env.ENABLE_ZUUL==='true'){
  return run('test-zuul')
}
return run('test-local')
