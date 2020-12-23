# Install docker
```console
yum install docker
systemctl enable docker
service docker start
```

# Install php with fpm
```console
docker pull php:fpm
```

# Create bridge network
```console
docker network create --drive bridge www-net
docker network ls
```

# Install vmware tools and mount shared folder
- Right click current VM -> Settings -> Options -> Shared folders
- Always Enable
- Add shared folder
- Install vm tools and mount shared folder to /home/storage:
```console
yum install -y open-vm-tools

mkdir /home/storage

/usr/bin/vmhgfs-fuse .host:/ /home/storage -o subtype=vmhgfs-fuse,allow_other
```

# Create php container
```console
docker run -d --name c-php -h php -v /home/storage/Shared/mycode/:/home/mycode --network www-net docker.io/php:fpm
```
- -d: run in background when created
- -h: set hostname
- -v: mount volumn

# Terminal into container
```console
docker exec -it c-php bash
```

# Install httpd

## pull image
```console
docker pull httpd
```

## create container, get conf and remove container
```console
docker run --rm -v /home/storage/Shared/mycode/:/home/mycode/ httpd cp /usr/local/apache2/conf/httpd.conf /home/mycode/
```
- --rm: remove container after exit
- cp: copy file config

## add permission
```console
chmod 644 /home/storage/Shared/mycode/* -R
```

## config httpd
- edit httpd.conf (copied before)
    - un-rem *LoadModule proxy_module modules/mod_proxy.so*
    - un-rem *LoadModule proxy_fcgi_module modules/mod_proxy_fcgi.so*
    - add at the end of file: *AddHandler "proxy:fcgi://c-php:9000" .php*
    - change DocumentRoot directory (all 2 config)
        - "/usr/local/apache2/htdocs" => "/home/mycode/www"

## create container
```console
docker run -d --name c-httpd -h httpd --network www-net -p 9999:80 -p 443:443 -v /home/storage/Shared/mycode:/home/mycode -v /home/storage/Shared/mycode/httpd.conf:/usr/local/apache2/conf/httpd.conf httpd
```

# Install mysql

## pull image
```console
docker pull mysql
```
- port: 3304
- config: /etc/mysql/my.cnf
- username: root
- database: /var/lib/mysql
- enviroment variable
    - password: MYSQL_ROOT_PASSWORD

## run and get config
```console
docker run --rm -v /home/storage/Shared/mycode:/home/mycode mysql cp /etc/mysql/my.cnf /home/mycode
```

## config
- edit file my.cnf
    - add to last: *default-authentication-plugin=mysql_native_password*
- create folder db on mycode to stored db

## create container
docker run -e MYSQL_ROOT_PASSWORD=1234@Bcd -v /home/storage/Shared/mycode/my.cnf:/etc/mysql/my.cnf -v /home/storage/Shared/mycode/db/:/var/lib/mysql --name c-mysql mysql