import shell from 'shelljs'

shell.exec('pnpm run build')
shell.cd('dist')
shell.exec('git init')
shell.exec('git add -A')
shell.exec('git commit -m "deploy"')
shell.exec('git push -f git@gitee.com:justorez/xxx.git master:pages')
// shell.rm('-rf', '.git')
