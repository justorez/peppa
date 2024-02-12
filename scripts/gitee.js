import shell from 'shelljs'

shell.cd('dist')
shell.exec('git config --global user.email "alonezero@foxmail.com"')
shell.exec('git config --global user.name "justorez"')
shell.exec('git init')
shell.exec('git add -A')
shell.exec('git commit -m "deploy"')
shell.exec('git push -f git@gitee.com:justorez/peppa.git master:pages')
// shell.rm('-rf', '.git')
