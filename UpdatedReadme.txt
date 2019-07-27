for OS Ubuntu 16.4

Node 6.11

    - sudo apt-get update
    - sudo apt-get install nodejs
    
npm

    - sudo apt-get install npm

Apache2

    - sudo apt-get install apache2
    - sudo systemctl restart apache2

Postgres 9.6

    -  sudo apt-get -y install postgresql postgresql-contrib phppgadmin

        - cd /etc/apache2/conf-available/
        - nano phppgadmin.conf
                # Require local
                Allow From all
        - cd /etc/phppgadmin/
        - nano config.inc.php
                $conf['extra_login_security'] = false;

PHP 7
 
    - sudo apt-get install php libapache2-mod-php php-mcrypt php-gd

Node Modules as per Required

    - npm install
        azure-storage
        datauri
        get-video-duration
        get-video-dimensions
        shelljs
        xoauth2
        stripe

FFMPEG

    - sudo add-apt-repository ppa:jonathonf/ffmpeg-3
    - sudo apt update && sudo apt upgrade
    - sudo apt install ffmpeg

GM

    - sudo apt install graphicsmagick

PM2

    - npm install pm2 -g



