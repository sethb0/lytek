#!/bin/sh
cd dist/assets
for x in css/* js/* fonts/*.ttf
do
  if [ $(node ../../filesize.js "$x") -ge 4096 ]
  then
    gzip -k -n -v "$x" && touch -r "$x" "$x.gz"
  fi
done
rm js/*.map
cd ../..
ssh sharpcla.ws 'sudo rm -rf dist-lytek' \
  && scp -r dist sharpcla.ws:dist-lytek \
  && ssh sharpcla.ws 'sh -c \
    "sudo chown -R root:root dist-lytek \
      && sudo rm -rf /var/www/vhosts/lytek.old \
      && sudo mv /var/www/vhosts/lytek /var/www/vhosts/lytek.old \
      && sudo mv dist-lytek /var/www/vhosts/lytek"'
