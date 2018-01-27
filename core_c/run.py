import subprocess

#subprocess.call("node-gyp --directory=route rebuild --msvs_version=2015",shell=True)
#subprocess.call("node route.js")

subprocess.call("node-gyp --directory=fs rebuild --msvs_version=2015",shell=True)
subprocess.call("node fs.js")