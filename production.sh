#!/bin/sh
sudo -u lytek sh -c "cd
  rm -rf git
  kill \$(ps -aux | fgrep nohup | fgrep -v grep | tr -s ' ' ' ' | cut -d' ' -f2)
  git clone https://github.com/sethb0/ven2-lytek.git git \
    && cd git \
    && NODE_ENV=production FONTAWESOME_NPM_TOKEN=$FONTAWESOME_NPM_TOKEN npm i \
    && cd .. \
    && mv production production.old \
    && mkdir production \
    && cp production.old/.env.production production/ \
    && touch -r production.old/.env.production production/.env.production \
    && for x in babel.config.js bot node_modules package.json run.js server
      do
        cp -r git/\$x production/
      done" \
  && sudo chown -R root:lytek ~lytek/production \
  && sudo -u lytek sh -c 'cd ~/production
    export NODE_ENV=production
    export BABEL_DISABLE_CACHE=1
    export BABEL_ENV=server
    export VUE_CLI_BABEL_TRANSPILE_MODULES=1
    nohup node --require @babel/register run.js server > ../server.log &
    nohup node --require @babel/register run.js bot > ../bot.log &'
